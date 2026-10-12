const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "growth_lodge",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});

module.exports = db;