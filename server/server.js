const app = require('./app');
const db = require('./models');
const config = require('./config/config');

const start = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('MySQL connection established.');

    // sync() creates any tables that don't exist yet, without touching
    // tables/data that are already there. Fine for this stage of the
    // project; swap for Sequelize migrations before this goes to production,
    // since sync({ alter: true }) can be destructive on a live database.
    await db.sequelize.sync();
    console.log('Database models synced.');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Server will still start, but database-backed routes will fail until this is fixed.');
  }

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
};

start();
