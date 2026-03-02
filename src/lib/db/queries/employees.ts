import { jsonDb } from "@/lib/json-db";

export const getEmployees = async () => {
    const employees = await jsonDb.getEmployees();
    return employees.sort((a: any, b: any) => a.name.localeCompare(b.name));
}
