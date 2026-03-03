import { mysqlTable, varchar, decimal, json, timestamp, int } from "drizzle-orm/mysql-core";

export const locations = mysqlTable("locations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
});

export const employees = mysqlTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 20 }),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  type: varchar("type", { length: 10 }), // 's' for simple, '' for quantity
});

export const supplyLists = mysqlTable("supply_lists", {
  id: varchar("id", { length: 36 }).primaryKey(),
  locationId: varchar("location_id", { length: 36 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // DD.MM.YYYY
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  cardRevenue: decimal("card_revenue", { precision: 10, scale: 2 }).default("0.00"),
  employees: json("employees").notNull(), // JSON mapping name to shift
  products: json("products").notNull(),   // JSON mapping name to quantity
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
