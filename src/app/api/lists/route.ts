import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const date = searchParams.get('date');

  if (!location || !date) {
    return NextResponse.json({ error: 'Missing location or date' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'database', 'raports', location, `${date}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ products: data.products || {} });
  } catch (error) {
    console.error(`Error reading file for ${location} on ${date}:`, error);
    return NextResponse.json({ error: 'File not found or could not be read' }, { status: 404 });
  }
}
