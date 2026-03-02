import { relations } from "drizzle-orm";
import { mysqlTable, varchar, int, decimal, date, boolean } from "drizzle-orm/mysql-core";

// --- CORE TABLES ---

export const employees = mysqlTable("employees", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("29.00").notNull(),
  icon: varchar("icon", { length: 100 }).default("User").notNull(),
  color: varchar("color", { length: 50 }).default("#D35400").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const locations = mysqlTable("locations", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  address: varchar("address", { length: 255 }).default("").notNull(),
  icon: varchar("icon", { length: 100 }).default("MapPin").notNull(),
  color: varchar("color", { length: 50 }).default("#D35400").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const categories = mysqlTable("categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    icon: varchar("icon", { length: 100 }).default("Tag").notNull(),
    color: varchar("color", { length: 50 }).default("#8E44AD").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  categoryId: int("category_id"),
  type: varchar("type", { length: 50 }).default("amount").notNull(), // 'amount' or 'checkbox'
  icon: varchar("icon", { length: 100 }).default("Package").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// --- DATA TABLES ---

export const dailyRevenues = mysqlTable("daily_revenues", {
    id: int("id").primaryKey().autoincrement(),
    locationId: int("location_id").notNull(),
    reportDate: date("report_date", { mode: "string" }).notNull(),
    totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
    cardRevenue: decimal("card_revenue", { precision: 10, scale: 2 }).default("0").notNull(),
});

export const workLogs = mysqlTable("work_logs", {
    id: int("id").primaryKey().autoincrement(),
    employeeId: int("employee_id").notNull(),
    locationId: int("location_id").notNull(),
    reportDate: date("report_date", { mode: "string" }).notNull(),
    hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
});

export const inventoryLevels = mysqlTable("inventory_levels", {
    id: int("id").primaryKey().autoincrement(),
    productId: int("product_id").notNull(),
    locationId: int("location_id").notNull(),
    reportDate: date("report_date", { mode: "string" }).notNull(),
    quantity: int("quantity").notNull(),
});


// --- RELATIONS ---

export const locationsRelations = relations(locations, ({ many }) => ({
	dailyRevenues: many(dailyRevenues),
	workLogs: many(workLogs),
	inventoryLevels: many(inventoryLevels),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
	workLogs: many(workLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
	inventoryLevels: many(inventoryLevels),
}));

export const dailyRevenuesRelations = relations(dailyRevenues, ({ one }) => ({
	location: one(locations, {
		fields: [dailyRevenues.locationId],
		references: [locations.id],
	}),
}));

export const workLogsRelations = relations(workLogs, ({ one }) => ({
	employee: one(employees, {
		fields: [workLogs.employeeId],
		references: [employees.id],
	}),
	location: one(locations, {
		fields: [workLogs.locationId],
		references: [locations.id],
	}),
}));

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
	product: one(products, {
		fields: [inventoryLevels.productId],
		references: [products.id],
	}),
	location: one(locations, {
		fields: [inventoryLevels.locationId],
		references: [locations.id],
	}),
}));
