import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

// Establish MySQL connection
const poolConnection = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "burbone_db",
  port: Number(process.env.MYSQL_PORT) || 3306,
  connectionLimit: 10,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
