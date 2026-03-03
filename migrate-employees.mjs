import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database');
const REPORTS_DIR = path.join(DB_DIR, 'raports');
const EMPLOYEES_FILE = path.join(DB_DIR, 'employees.json');

const employees = JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
const nameToId = {};
employees.forEach(e => {
  nameToId[e.name] = e.id;
});

function migrateReports() {
  const dirs = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const locPath = path.join(REPORTS_DIR, dir.name);
      const files = fs.readdirSync(locPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(locPath, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            let modified = false;
            
            if (data.employees) {
              const newEmployees = {};
              for (const [key, val] of Object.entries(data.employees)) {
                // If key is a name and we have an ID for it
                if (nameToId[key]) {
                  newEmployees[nameToId[key]] = val;
                  modified = true;
                } else {
                  // Already an ID or unknown name
                  newEmployees[key] = val;
                }
              }
              data.employees = newEmployees;
            }
            
            if (modified) {
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              console.log(`Migrated ${file}`);
            }
          } catch (e) {
            console.error(`Failed on ${file}`, e);
          }
        }
      }
    }
  }
}

migrateReports();
