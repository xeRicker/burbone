import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const provider = process.env.DATABASE_PROVIDER ?? 'json';

function createMySQLClient() {
  const connection = mysql.createPool(process.env.DATABASE_URL!);
  return drizzle(connection, { schema, mode: "default" });
}

// Simple JSON client mockup for dev
// In a real scenario, this would read/write to /data/*.json
function createJSONClient() {
  return {
    query: {
      supplyLists: {
        findMany: async () => [],
        findFirst: async () => null,
      },
      locations: {
        findMany: async () => [
          { id: '1', name: 'Oświęcim', icon: '🏰' },
          { id: '2', name: 'Wilamowice', icon: '🏡' },
          { id: '3', name: 'Osiek', icon: '🌳' },
        ],
      },
    },
    insert: () => ({ values: () => Promise.resolve() }),
    select: () => ({ from: () => ({ where: () => [] }) }),
  } as any;
}

export const db = provider === 'mysql' ? createMySQLClient() : createJSONClient();
