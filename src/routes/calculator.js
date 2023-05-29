const express = require("express");
const router = express.Router();
const Calculator = require("../models/calculator");
const User = require("../models/user");
const bodyParser = require("body-parser");
const multer = require("multer");
const sequelize = require("../config/database");

const upload = multer();
router.use(upload.none());

// Calculate the debt free date
function calculateDebtFreeDate(
  outstandingBalance,
  minimumPayment,
  monthlyIncome,
  additionalPayment,
  annualInterestRate
) {
  // Convert annual interest rate to monthly interest rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // Calculate the monthly surplus
  const monthlySurplus = monthlyIncome;

  // Calculate the minimum payment timeline
  let remainingBalance = outstandingBalance;
  let minimumPaymentTimeline = 0;
  while (remainingBalance > 0) {
    const interestAccrued = remainingBalance * monthlyInterestRate;
    remainingBalance += interestAccrued;
    remainingBalance -= minimumPayment;
    minimumPaymentTimeline++;
  }

  // Calculate the additional payment timeline
  remainingBalance = outstandingBalance;
  let additionalPaymentTimeline = 0;
  while (remainingBalance > 0) {
    const interestAccrued = remainingBalance * monthlyInterestRate;
    remainingBalance += interestAccrued;
    remainingBalance -= minimumPayment + additionalPayment;
    additionalPaymentTimeline++;
  }

  // Determine the debt-free dates
  const debtFreeDateMinimumPayment = new Date();
  debtFreeDateMinimumPayment.setMonth(
    debtFreeDateMinimumPayment.getMonth() + minimumPaymentTimeline
  );

  const debtFreeDateAdditionalPayment = new Date();
  debtFreeDateAdditionalPayment.setMonth(
    debtFreeDateAdditionalPayment.getMonth() + additionalPaymentTimeline
  );

  return {
    debtFreeDateMinimumPayment,
    debtFreeDateAdditionalPayment,
  };
}

// Create a new calculator entry
router.post("/calculator", async (req, res) => {
  const {
    calculatorType,
    savingsGoal,
    startingBalance,
    timeToGrow,
    timeUnit,
    annualInterestRate,
    loanAmount,
    monthlyPayment,
    debtAmount,
    interestRateDebt,
    income,
    expenses,
    contributionAmount,
    contributionCadence,
    compoundFrequency,
    loanDuration, // Added parameter for mortgage calculator
    interestRate,
    userId
  } = req.body;

  console.log(req.body);

  let result;

  if (calculatorType === "savings") {
    let totalContributions = 0;
    let currentBalance = Number(startingBalance);

    // Calculate the total contributions based on contribution amount and cadence
    if (contributionCadence === "weekly") {
      totalContributions = Number(timeToGrow) * 52 * Number(contributionAmount);
    } else if (contributionCadence === "biweekly") {
      totalContributions = Number(timeToGrow) * 26 * Number(contributionAmount);
    } else if (contributionCadence === "monthly") {
      totalContributions = Number(timeToGrow) * 12 * Number(contributionAmount);
    } else if (contributionCadence === "quarterly") {
      totalContributions = Number(timeToGrow) * 4 * Number(contributionAmount);
    } else if (contributionCadence === "annually") {
      totalContributions = Number(timeToGrow) * Number(contributionAmount);
    } else {
      return res
        .status(400)
        .json({ error: "Invalid contribution cadence provided." });
    }

    // Add the contribution amount to the starting balance
    currentBalance += totalContributions;

    // Calculate the growth of the balance
    if (compoundFrequency === "daily") {
      const dailyInterestRate = Number(annualInterestRate) / 36500; // Assuming 365 days in a year
      for (let i = 0; i < Number(timeToGrow); i++) {
        currentBalance += currentBalance * dailyInterestRate;
      }
    } else if (compoundFrequency === "monthly") {
      const monthlyInterestRate = Number(annualInterestRate) / 1200; // Assuming 12 months in a year
      for (let i = 0; i < Number(timeToGrow); i++) {
        currentBalance += currentBalance * monthlyInterestRate;
      }
    } else if (compoundFrequency === "quarterly") {
      const quarterlyInterestRate = Number(annualInterestRate) / 400; // Assuming 4 quarters in a year
      for (let i = 0; i < Number(timeToGrow); i++) {
        currentBalance += currentBalance * quarterlyInterestRate;
      }
    } else if (compoundFrequency === "annually") {
      const yearlyInterestRate = Number(annualInterestRate) / 100;
      for (let i = 0; i < Number(timeToGrow); i++) {
        currentBalance += currentBalance * yearlyInterestRate;
      }
    } else {
      return res
        .status(400)
        .json({ error: "Invalid compound frequency provided." });
    }

    result = currentBalance;
  } else if (calculatorType === "mortgage") {
    const interestRateDecimal = Number(interestRate) / 100;
    const monthlyInterestRate = interestRateDecimal / 12;
    const loanDurationMonths = Number(loanDuration) * 12;

    // Calculate the monthly EMI
    const emi =
      (loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, loanDurationMonths)) /
      (Math.pow(1 + monthlyInterestRate, loanDurationMonths) - 1);

    // Calculate the total amount payable
    const totalAmountPayable = emi * loanDurationMonths;

    // Calculate the interest component
    const interestComponent = totalAmountPayable - loanAmount;

    result = {
      suggestedMonthlyEMI: emi.toFixed(2),
      totalAmountPayable: totalAmountPayable.toFixed(2),
      interestComponent: interestComponent.toFixed(2),
    };
  } else if (calculatorType === "debt") {
    const debtType = req.body.debtType;
    const rateOfInterest = Number(req.body.rateOfInterest);
    const balance = Number(req.body.balance);
    const minimumPayment = Number(req.body.minimumPayment);
    const monthlyHouseholdIncome = req.body.monthlyHouseholdIncome
      ? Number(req.body.monthlyHouseholdIncome)
      : 0;
    const additionalPayment = req.body.additionalPayment
      ? Number(req.body.additionalPayment)
      : 0;

    if (!debtType || !rateOfInterest || !balance || !minimumPayment) {
      return res.status(400).json({
        error: "Missing required input parameters for debt calculator.",
      });
    }

    // Perform the relevant debt calculations
    const totalDebt = balance;
    const monthlyEMIWithMinimum = minimumPayment;
    const monthlyEMIWithAdditional = minimumPayment + additionalPayment;

    const debtFreeDates = calculateDebtFreeDate(
      balance,
      minimumPayment,
      monthlyHouseholdIncome,
      additionalPayment,
      rateOfInterest
    );

    const options = { month: "long", year: "numeric" };
    const debtFreeDateWithMinimum =
      debtFreeDates.debtFreeDateMinimumPayment.toLocaleDateString(
        undefined,
        options
      );
    const debtFreeDateWithAdditional =
      debtFreeDates.debtFreeDateAdditionalPayment.toLocaleDateString(
        undefined,
        options
      );

    // Prepare the response object
    result = {
      debtFreeDateWithMinimum,
      debtFreeDateWithAdditional,
      totalDebt,
      monthlyEMIWithMinimum,
      monthlyEMIWithAdditional,
    };
  } else if (calculatorType === "budget") {
    const monthlyIncome = Number(req.body.monthlyIncome);
    const otherIncome = Number(req.body.otherIncome);
    const monthlyExpenses = calculateTotalExpenses(req.body);

    const netIncome = monthlyIncome + otherIncome - monthlyExpenses;

    result = {
      monthlyIncome,
      monthlyExpenses,
      netIncome,
    };

    // Function to calculate total expenses
    function calculateTotalExpenses(expenses) {
      let totalExpenses = 0;
      for (const key in expenses) {
        if (
          expenses.hasOwnProperty(key) &&
          key !== "calculatorType" &&
          key !== "monthlyIncome" &&
          key !== "otherIncome" &&
          key !== "userId"
        ) {
          totalExpenses += Number(expenses[key]);
        }
      }
      return totalExpenses;
    }
  } else {
    return res.status(400).json({ error: "Invalid calculator type provided." });
  }

  // Store the input values and result in the database
  try {
    const calculator = await Calculator.create({
      calculatorType: calculatorType,
      savingsGoal: savingsGoal,
      startingBalance: startingBalance,
      timeToGrow: timeToGrow,
      timeUnit: timeUnit,
      annualInterestRate: annualInterestRate,
      loanAmount: loanAmount,
      monthlyPayment: monthlyPayment,
      debtAmount: debtAmount,
      interestRateDebt: interestRateDebt,
      income: income,
      expenses: expenses,
      contributionAmount: contributionAmount,
      contributionCadence: contributionCadence,
      compoundFrequency: compoundFrequency,
      loanDuration: loanDuration,
      interestRate: interestRate,
      suggestedMonthlyEMI: result?.suggestedMonthlyEMI,
      totalAmountPayable: result?.totalAmountPayable,
      interestComponent: result?.interestComponent,
      monthlyIncome: result?.monthlyIncome,
      monthlyExpenses: result?.monthlyExpenses,
      netIncome: result?.netIncome,
      userId: userId,
      result: result,
    });
    res.json({ result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while saving the calculation result.",
    });
  }
});

// Get a specific calculator entry by ID
router.get("/calculator/:id", async (req, res) => {
  try {
    const calculator = await Calculator.findByPk(req.params.id);
    if (!calculator) {
      res.status(404).json({ message: "Calculator entry not found" });
    } else {
      res.status(200).json(calculator);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new user
router.post("/user", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.create({ username });
    res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while creating the user.",
    });
  }
});

// Get a specific user by ID
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: Calculator,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get the previous 7 calculator entries for a specific user
// Get the last 7 calculator entries for each calculator type for a specific user
router.get("/calculator/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all distinct calculator types for the user
    const distinctCalculatorTypes = await Calculator.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('calculatorType')), 'calculatorType']],
      where: { userId },
      raw: true,
    });

    const calculators = [];

    // Fetch the last 7 calculator entries for each calculator type
    for (const { calculatorType } of distinctCalculatorTypes) {
      const calculatorEntries = await Calculator.findAll({
        where: { userId, calculatorType },
        order: [["createdAt", "DESC"]],
        limit: 7,
      });

      calculators.push(...calculatorEntries);
    }

    res.status(200).json(calculators);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
