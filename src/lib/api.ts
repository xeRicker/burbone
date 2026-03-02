"use server"

import { jsonDb } from "@/lib/json-db"

export async function fetchAllData() {
  try {
    const reports = await jsonDb.getReports();
    const locations = await jsonDb.getLocations();
    const employees = await jsonDb.getEmployees();
    const products = await jsonDb.getProducts();

    return reports.map((r: any) => ({
      id: r.id,
      location: locations.find((l: any) => l.id === r.locationId)?.name || "Nieznany",
      date: r.date,
      revenue: Number(r.revenue) || 0,
      cardRevenue: Number(r.cardRevenue) || 0,
      employees: r.workLogs?.reduce((acc: any, log: any) => {
        const emp = employees.find((e: any) => e.id === log.employeeId);
        if (emp) acc[emp.name] = log.hoursWorked;
        return acc;
      }, {}) || {},
      products: r.inventory?.reduce((acc: any, inv: any) => {
        const prod = products.find((p: any) => p.id === inv.productId);
        if (prod) acc[prod.name] = inv.quantity;
        return acc;
      }, {}) || {}
    })).sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Fetch Error:", error)
    return []
  }
}

export async function fetchEmployees() {
  try {
    return await jsonDb.getEmployees();
  } catch (error) {
    console.error("Fetch Employees Error:", error)
    return []
  }
}

export async function fetchLocations() {
  try {
    return await jsonDb.getLocations();
  } catch (error) {
    console.error("Fetch Locations Error:", error)
    return []
  }
}

export async function fetchProducts() {
  try {
    return await jsonDb.getProducts();
  } catch (error) {
    console.error("Fetch Products Error:", error)
    return []
  }
}
