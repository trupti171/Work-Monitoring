let Sequelize = require("sequelize");
let dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: process.env.DATABASE_DIALECT,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  },
);

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully of host=>'", process.env.DATABASE_HOST, "'"
    );
    // Your further database queries and operations can be performed here
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

// Call the function to connect to the database
connectToDatabase();

global.sequelize = sequelize;

module.exports = sequelize;
