import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const DB_DIR = path.join(process.cwd(), 'database');
const LOCATIONS_FILE = path.join(DB_DIR, 'locations.json');
const EMPLOYEES_FILE = path.join(DB_DIR, 'employees.json');
const CATEGORIES_FILE = path.join(DB_DIR, 'list', 'categories.json');

async function readJson(filePath: string, defaultVal: any) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultVal;
  }
}

export async function GET() {
  const locations = await readJson(LOCATIONS_FILE, []);
  const employees = await readJson(EMPLOYEES_FILE, []);
  const categories = await readJson(CATEGORIES_FILE, []);
  
  return NextResponse.json({ locations, employees, categories });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.mkdir(path.join(DB_DIR, 'list'), { recursive: true });
    
    await fs.writeFile(LOCATIONS_FILE, JSON.stringify(body.locations, null, 2));
    await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(body.employees, null, 2));
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(body.categories, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
