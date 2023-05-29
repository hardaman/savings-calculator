const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Calculator = sequelize.define("Calculator", {
  calculatorType: {
    type: DataTypes.ENUM("savings", "mortgage", "debt", "budget"),
    allowNull: false,
  },
  savingsGoal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  startingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  timeToGrow: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  timeUnit: {
    type: DataTypes.ENUM("years", "months"),
    allowNull: true,
  },
  annualInterestRate: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  loanAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  monthlyPayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  debtAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  interestRateDebt: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  income: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  expenses: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // New properties for mortgage calculator
  loanDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  interestRate: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  suggestedMonthlyEMI: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  totalAmountPayable: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  interestComponent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // New properties for Debt calculator
  debtType: {
    type: DataTypes.ENUM(
      "credit_card",
      "personal_loan",
      "mortgage",
      "student_loan",
      "auto_loan",
      "other"
    ),
    allowNull: true,
  },
  rateOfInterest: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  minimumPayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  monthlyHouseholdIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  additionalPayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  debtFreeDateMinPayment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  debtFreeDateAdditionalPayment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // New properties for Budget Calculator
  monthlyIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  otherIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  mortgage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  homeInsurance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  repairMaintenance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  waterGasElectricity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  cableTVInternet: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  phoneCell: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  carPayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  carInsurance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  gasFuel: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  carRepairs: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  schoolSupplies: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  studentLoans: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  collegeTuition: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  groceriesHousehold: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  clothing: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  entertainment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  medical: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  petSupplies: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  otherExpenses: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  emergencyFund: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  investment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  retirement: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
});

Calculator.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Calculator, { foreignKey: "userId" });


module.exports = Calculator;
