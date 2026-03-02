import { db } from "../src/db";
import * as schema from "../src/db/schema";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { eq, sql } from "drizzle-orm";

const LEGACY_DB_PATH = path.join(process.cwd(), "_legacy", "database");

const MIGRATION_SQL = `
CREATE TABLE \`daily_revenues\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`location_id\` int NOT NULL, \`report_date\` date NOT NULL, \`total_revenue\` decimal(10,2) NOT NULL, \`card_revenue\` decimal(10,2) NOT NULL DEFAULT '0', CONSTRAINT \`daily_revenues_id\` PRIMARY KEY(\`id\`) );
CREATE TABLE \`employees\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`name\` varchar(255) NOT NULL, \`hourly_rate\` decimal(10,2) NOT NULL DEFAULT '29.00', \`icon\` varchar(100) NOT NULL DEFAULT 'User', \`color\` varchar(50) NOT NULL DEFAULT '#D35400', \`is_active\` boolean NOT NULL DEFAULT true, CONSTRAINT \`employees_id\` PRIMARY KEY(\`id\`), CONSTRAINT \`employees_name_unique\` UNIQUE(\`name\`) );
CREATE TABLE \`inventory_levels\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`product_id\` int NOT NULL, \`location_id\` int NOT NULL, \`report_date\` date NOT NULL, \`quantity\` int NOT NULL, CONSTRAINT \`inventory_levels_id\` PRIMARY KEY(\`id\`) );
CREATE TABLE \`locations\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL DEFAULT '', \`icon\` varchar(100) NOT NULL DEFAULT 'MapPin', \`color\` varchar(50) NOT NULL DEFAULT '#D35400', \`is_active\` boolean NOT NULL DEFAULT true, CONSTRAINT \`locations_id\` PRIMARY KEY(\`id\`), CONSTRAINT \`locations_name_unique\` UNIQUE(\`name\`) );
CREATE TABLE \`products\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`name\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL DEFAULT 'Inne', \`type\` varchar(50) NOT NULL DEFAULT 'amount', \`icon\` varchar(100) NOT NULL DEFAULT 'Package', \`is_active\` boolean NOT NULL DEFAULT true, CONSTRAINT \`products_id\` PRIMARY KEY(\`id\`), CONSTRAINT \`products_name_unique\` UNIQUE(\`name\`) );
CREATE TABLE \`work_logs\` ( \`id\` int AUTO_INCREMENT NOT NULL, \`employee_id\` int NOT NULL, \`location_id\` int NOT NULL, \`report_date\` date NOT NULL, \`hours_worked\` decimal(5,2) NOT NULL, CONSTRAINT \`work_logs_id\` PRIMARY KEY(\`id\`) );
`;

type JsonReport = { location: string; date: string; employees?: { [name: string]: string }; products?: { [name:string]: number }; revenue?: number; cardRevenue?: number; };

function parseHoursWorked(timeRange: string): number {
    if (!timeRange || !timeRange.includes('–')) return 0;
    const [startStr, endStr] = timeRange.split('–').map(s => s.trim());
    const [startHours, startMinutes] = startStr.split(':').map(Number);
    const [endHours, endMinutes] = endStr.split(':').map(Number);
    if (isNaN(startHours) || isNaN(endHours)) return 0;
    const startDate = new Date(0);
    startDate.setUTCHours(startHours, startMinutes || 0);
    const endDate = new Date(0);
    endDate.setUTCHours(endHours, endMinutes || 0);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
    return parseFloat(((endDate.getTime() - startDate.getTime()) / 3600000).toFixed(2));
}

const formatSqlDate = (dateStr: string): string => {  const [day, month, year] = dateStr.split('.'); return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; };

async function importData() {
    console.log("🚀 Starting FINAL legacy data import...");
    await db.execute(sql.raw(`SET FOREIGN_KEY_CHECKS = 0;`));
    const [results] = await db.execute(sql.raw(`SHOW TABLES;`)) as [any[], any];
    const tableNames = results.map((row: any) => Object.values(row)[0] as string);
    for (const tableName of tableNames) {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${tableName}\`;`));
    }
    await db.execute(sql.raw(`SET FOREIGN_KEY_CHECKS = 1;`));
    console.log("✅ Dropped all tables.");
    const individualStatements = MIGRATION_SQL.split(';').filter(s => s.trim().length > 0);
    for (const statement of individualStatements) {
        await db.execute(sql.raw(statement));
    }
    console.log("✅ Schema recreated.");
    
    const locationsMap = new Map<string, number>();
    const employeesMap = new Map<string, number>();
    const productsMap = new Map<string, number>();

    const locationDirs = await readdir(LEGACY_DB_PATH, { withFileTypes: true });
    for (const dir of locationDirs) {
        if (dir.isDirectory()) {
            const locationName = dir.name.charAt(0).toUpperCase() + dir.name.slice(1);
            await db.insert(schema.locations).values({ name: locationName });
            const newLoc = await db.query.locations.findFirst({ where: eq(schema.locations.name, locationName) });
            locationsMap.set(dir.name, newLoc!.id);
        }
    }
    console.log(`✅ Inserted ${locationsMap.size} locations.`);

    const allWorkLogs: (typeof schema.workLogs.$inferInsert)[] = [];
    const allInventoryLevels: (typeof schema.inventoryLevels.$inferInsert)[] = [];
    const allDailyRevenues: (typeof schema.dailyRevenues.$inferInsert)[] = [];

    for (const [locationDirName, locationId] of locationsMap.entries()) {
        const files = await readdir(path.join(LEGACY_DB_PATH, locationDirName));
        for (const file of files) {
            if (path.extname(file) !== '.json') continue;
            const content = await readFile(path.join(LEGACY_DB_PATH, locationDirName, file), 'utf-8');
            const report: JsonReport = JSON.parse(content);
            const reportDate = formatSqlDate(report.date);

            if (report.employees) {
                for (const [name, timeRange] of Object.entries(report.employees)) {
                    let employeeId = employeesMap.get(name);
                    if (!employeeId) {
                       await db.insert(schema.employees).values({ name });
                       const newEmp = await db.query.employees.findFirst({ where: eq(schema.employees.name, name) });
                       employeeId = newEmp!.id;
                       employeesMap.set(name, employeeId);
                    }
                    allWorkLogs.push({ employeeId, locationId, reportDate, hoursWorked: parseHoursWorked(timeRange) });
                }
            }
            if (report.products) {
                for (const [name, quantity] of Object.entries(report.products)) {
                    let productId = productsMap.get(name);
                    if (!productId) {
                        await db.insert(schema.products).values({ name });
                        const newProd = await db.query.products.findFirst({ where: eq(schema.products.name, name) });
                        productId = newProd!.id;
                        productsMap.set(name, productId);
                    }
                    allInventoryLevels.push({ productId, locationId, reportDate, quantity });
                }
            }
            if (typeof report.revenue === 'number') {
                 allDailyRevenues.push({ locationId, reportDate, totalRevenue: report.revenue, cardRevenue: report.cardRevenue ?? 0 });
            }
        }
    }
    
    if (allWorkLogs.length > 0) await db.insert(schema.workLogs).values(allWorkLogs);
    if (allInventoryLevels.length > 0) await db.insert(schema.inventoryLevels).values(allInventoryLevels);
    if (allDailyRevenues.length > 0) await db.insert(schema.dailyRevenues).values(allDailyRevenues);

    console.log("🎉 Import complete!");
}

importData().catch(err => console.error("❌ An error occurred during import:", err) && process.exit(1));
