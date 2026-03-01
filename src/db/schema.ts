import { mysqlTable, varchar, int, decimal, text, date, json } from "drizzle-orm/mysql-core";

export const reports = mysqlTable("reports", {
  id: int("id").primaryKey().autoincrement(),
  location: varchar("location", { length: 255 }).notNull(),
  reportDate: date("report_date").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  cardRevenue: decimal("card_revenue", { precision: 10, scale: 2 }).notNull(),
  
  // JSON field for employees shifts (e.g. { "Paweł": "12:00-20:00" })
  employees: json("employees"),
  
  // JSON field for products (e.g. { "Bułki": 10, "Mięso: Duże": 2 })
  products: json("products"),
});
