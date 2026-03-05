
import { promises as fs } from 'fs';
import path from 'path';
import ListView from './list-view';

async function getAvailableLists() {
  const reportsPath = path.join(process.cwd(), 'database', 'raports');
  const lists = [];

  try {
    const locations = await fs.readdir(reportsPath);
    for (const location of locations) {
      if ((await fs.stat(path.join(reportsPath, location))).isDirectory()) {
        const locationPath = path.join(reportsPath, location);
        const files = await fs.readdir(locationPath);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            lists.push({
              location,
              date: file.replace('.json', ''),
              path: path.join(location, file),
            });
          }
        });
      }
    }
    // Sort lists by date, newest first
    lists.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    });
    
    return lists;
  } catch (error) {
    console.error('Error reading lists:', error);
    return [];
  }
}

export default async function ListsPage() {
  const lists = await getAvailableLists();

  return <ListView lists={lists} />;
}
