"use server"

import { jsonDb } from "@/lib/json-db"
import { revalidatePath } from "next/cache"

export async function upsertLocation(data: any) {
    try {
        const { id, ...values } = data;

        if (id) {
            await jsonDb.updateLocation(Number(id), values);
        } else {
            await jsonDb.addLocation(values);
        }
        revalidatePath("/locations");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteLocation(id: number) {
    try {
        await jsonDb.deleteLocation(id);
        revalidatePath("/locations");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function upsertEmployee(data: any) {
    try {
        const { id, ...values } = data;

        if (id) {
            await jsonDb.updateEmployee(Number(id), values);
        } else {
            await jsonDb.addEmployee(values);
        }
        revalidatePath("/employees");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteEmployee(id: number) {
    try {
        await jsonDb.deleteEmployee(id);
        revalidatePath("/employees");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function upsertReport(data: any) {
    try {
        const { id, ...values } = data;
        if (id) {
            await jsonDb.updateReport(Number(id), values);
        } else {
            await jsonDb.addReport(values);
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function batchUpdateSettings(data: {
    locations: any[];
    employees: any[];
    products: any[];
    categories: any[];
}) {
    try {
        if (data.locations) await jsonDb.saveLocations(data.locations);
        if (data.employees) await jsonDb.saveEmployees(data.employees);
        if (data.products) await jsonDb.saveProducts(data.products);
        if (data.categories) await jsonDb.saveCategories(data.categories);
        
        revalidatePath("/admin");
        revalidatePath("/locations");
        revalidatePath("/employees");
        revalidatePath("/products");
        revalidatePath("/categories");
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

