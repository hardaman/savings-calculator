const express = require('express');
const app = express();
const calculatorRoutes = require('./routes/calculator');
const bodyParser = require('body-parser');

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use('/api', calculatorRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
