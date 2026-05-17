const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('healthcare_db', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql'
});

async function updateDB() {
  try {
    await sequelize.query("UPDATE users SET isEmailVerified = 1 WHERE email = 'patient1@gmail.com'");
    console.log("Database updated successfully!");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await sequelize.close();
  }
}

updateDB();
