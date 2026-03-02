import { db } from "./index";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔄 Resetting database...");

  // 1. Drop all tables
  const tableNames = Object.keys(schema);
  for (const tableName of tableNames) {
      if(typeof (schema as any)[tableName].execute === 'function') { // A simple check if it's a table object
          try {
            await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${tableName}\`;`));
            console.log(`  - Dropped table: ${tableName}`);
          } catch(e) {
            // Might fail if it's not a table, that's okay.
          }
      }
  }

  // NOTE: This is a simplified reset. For production, you would use Drizzle migrations.
  // For this project, a hard reset is sufficient. We will let the import script
  // recreate the schema implicitly or run a migration right after.
  
  console.log("✅ Database reset complete.");
}

main().catch((err) => {
  console.error("❌ An error occurred during database setup:", err);
  process.exit(1);
});
