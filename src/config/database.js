const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('savingscalculator', 'root', 'Indigo@123', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10, // maximum number of connections in the pool
    min: 0, // minimum number of connections in the pool
    idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
  },
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = sequelize;
