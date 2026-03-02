import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "burbone_db",
    port: Number(process.env.MYSQL_PORT) || 3306,
  });

  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("DROP TABLE IF EXISTS report_products;");
    await connection.query("DROP TABLE IF EXISTS report_employees;");
    await connection.query("DROP TABLE IF EXISTS reports;");
    await connection.query("DROP TABLE IF EXISTS employees;");
    await connection.query("DROP TABLE IF EXISTS locations;");
    await connection.query("DROP TABLE IF EXISTS products;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Tables dropped.");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
