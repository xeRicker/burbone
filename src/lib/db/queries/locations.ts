import { jsonDb } from "@/lib/json-db";

export const getLocations = async () => {
    const locations = await jsonDb.getLocations();
    return locations.sort((a: any, b: any) => a.name.localeCompare(b.name));
}
