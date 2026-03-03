import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const REPORTS_DIR = path.join(process.cwd(), 'database', 'raports');

export async function GET() {
  try {
    const reports: any[] = [];
    const dirs = await fs.readdir(REPORTS_DIR, { withFileTypes: true });
    
    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const locPath = path.join(REPORTS_DIR, dir.name);
        const files = await fs.readdir(locPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const data = await fs.readFile(path.join(locPath, file), 'utf-8');
              const parsed = JSON.parse(data);
              // Ensure we have a location from the directory if it's missing
              if (!parsed.location) {
                parsed.location = dir.name.charAt(0).toUpperCase() + dir.name.slice(1);
              }
              // Extract date from filename if missing or malformed
              if (!parsed.date) {
                parsed.date = file.replace('.json', '');
              }
              reports.push(parsed);
            } catch (e) {
              console.error(`Failed to parse ${file}`);
            }
          }
        }
      }
    }
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error reading reports directory", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, date } = body;
    
    if (!location || !date) {
       return NextResponse.json({ error: 'Missing location or date' }, { status: 400 });
    }
    
    const locDir = path.join(REPORTS_DIR, location.toLowerCase());
    await fs.mkdir(locDir, { recursive: true });
    
    const filePath = path.join(locDir, `${date}.json`);
    await fs.writeFile(filePath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}
