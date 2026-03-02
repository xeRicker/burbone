import { jsonDb } from "@/lib/json-db";

type GetProductsParams = {
    query?: string;
    category?: string;
}

export const getProducts = async ({ query, category }: GetProductsParams = {}) => {
    let products = await jsonDb.getProducts();
    
    if (query) {
        const lowerQuery = query.toLowerCase();
        products = products.filter((p: any) => p.name.toLowerCase().includes(lowerQuery));
    }
    
    if (category) {
        // We might need to map category name to ID or vice versa depending on how it's stored
        // For now, let's assume category is an ID if it's a number-like string
        const categoryId = parseInt(category);
        if (!isNaN(categoryId)) {
            products = products.filter((p: any) => p.categoryId === categoryId);
        } else {
            // Otherwise try to find category by name
            const categories = await jsonDb.getCategories();
            const foundCat = categories.find((c: any) => c.name === category);
            if (foundCat) {
                products = products.filter((p: any) => p.categoryId === foundCat.id);
            }
        }
    }

    return products.sort((a: any, b: any) => a.name.localeCompare(b.name));
}
