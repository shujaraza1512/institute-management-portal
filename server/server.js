const app = require('./app');
const sequelize = require('./config/db');
const config = require('./config/config');

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established.');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Server will still start, but database-backed routes will fail until this is fixed.');
  }

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
};

start();
