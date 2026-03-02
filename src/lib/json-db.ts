import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data");
const REPORTS_PATH = path.join(DATA_PATH, "reports");

async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') throw error;
  }
}

async function readJson<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(DATA_PATH, filename);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as T[];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  try {
    const filePath = path.join(DATA_PATH, filename);
    await writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

export const jsonDb = {
  // Locations
  async getLocations() {
    return readJson<any>("locations.json");
  },
  async saveLocations(locations: any[]) {
    return writeJson("locations.json", locations);
  },
  async updateLocation(id: number, data: any) {
    const locations = await this.getLocations();
    const index = locations.findIndex((l: any) => l.id === id);
    if (index !== -1) {
      locations[index] = { ...locations[index], ...data };
      await this.saveLocations(locations);
      return true;
    }
    return false;
  },
  async addLocation(data: any) {
    const locations = await this.getLocations();
    const newId = Math.max(0, ...locations.map((l: any) => l.id)) + 1;
    const newLocation = { ...data, id: newId };
    locations.push(newLocation);
    await this.saveLocations(locations);
    return newLocation;
  },
  async deleteLocation(id: number) {
    const locations = await this.getLocations();
    const filtered = locations.filter((l: any) => l.id !== id);
    await this.saveLocations(filtered);
    return true;
  },

  // Employees
  async getEmployees() {
    return readJson<any>("employees.json");
  },
  async saveEmployees(employees: any[]) {
    return writeJson("employees.json", employees);
  },
  async updateEmployee(id: number, data: any) {
    const employees = await this.getEmployees();
    const index = employees.findIndex((e: any) => e.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...data };
      await this.saveEmployees(employees);
      return true;
    }
    return false;
  },
  async addEmployee(data: any) {
    const employees = await this.getEmployees();
    const newId = Math.max(0, ...employees.map((e: any) => e.id)) + 1;
    const newEmployee = { ...data, id: newId };
    employees.push(newEmployee);
    await this.saveEmployees(employees);
    return newEmployee;
  },
  async deleteEmployee(id: number) {
    const employees = await this.getEmployees();
    const filtered = employees.filter((e: any) => e.id !== id);
    await this.saveEmployees(filtered);
    return true;
  },

  // Products
  async getProducts() {
    return readJson<any>("products.json");
  },
  async saveProducts(products: any[]) {
    return writeJson("products.json", products);
  },

  // Categories
  async getCategories() {
    return readJson<any>("categories.json");
  },
  async saveCategories(categories: any[]) {
    return writeJson("categories.json", categories);
  },

  // Reports
  async getReports() {
    try {
      const locations = await this.getLocations();
      const allReports: any[] = [];

      for (const loc of locations) {
        const locDirName = loc.name.toLowerCase();
        const locPath = path.join(REPORTS_PATH, locDirName);
        
        try {
          const files = await readdir(locPath);
          const jsonFiles = files.filter(f => f.endsWith('.json'));
          
          for (const file of jsonFiles) {
            const content = await readFile(path.join(locPath, file), "utf-8");
            allReports.push(JSON.parse(content));
          }
        } catch (e) {
          // Directory might not exist yet if no reports for this location
          continue;
        }
      }

      return allReports;
    } catch (error) {
      console.error("Error reading reports:", error);
      return [];
    }
  },
  async addReport(data: any) {
    const reports = await this.getReports();
    const newId = Math.max(0, ...reports.map((r: any) => r.id)) + 1;
    const newReport = { ...data, id: newId };
    
    const locations = await this.getLocations();
    const loc = locations.find((l: any) => l.id === data.locationId);
    const locDirName = loc ? loc.name.toLowerCase() : 'unknown';
    
    const locPath = path.join(REPORTS_PATH, locDirName);
    await ensureDir(locPath);

    const [year, month, day] = data.date.split('-');
    const formattedDate = `${day}.${month}.${year}`;
    const filePath = path.join(locPath, `${formattedDate}.json`);

    await writeFile(filePath, JSON.stringify(newReport, null, 2));
    return newReport;
  },
  async updateReport(id: number, data: any) {
    // We need to find the file first because we don't know the date/location if only ID is provided
    // but usually 'data' will contain date and locationId
    const reports = await this.getReports();
    const report = reports.find((r: any) => r.id === id);
    
    if (!report) return false;

    const updatedReport = { ...report, ...data };
    
    const locations = await this.getLocations();
    const loc = locations.find((l: any) => l.id === updatedReport.locationId);
    const locDirName = loc ? loc.name.toLowerCase() : 'unknown';
    
    const locPath = path.join(REPORTS_PATH, locDirName);
    await ensureDir(locPath);

    const [year, month, day] = updatedReport.date.split('-');
    const formattedDate = `${day}.${month}.${year}`;
    const filePath = path.join(locPath, `${formattedDate}.json`);

    await writeFile(filePath, JSON.stringify(updatedReport, null, 2));
    return true;
  }
};
