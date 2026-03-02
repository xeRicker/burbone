"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/features/products/products-table";
import { useDataStore } from "@/stores/data-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const { products, categories } = useDataStore();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products
      .filter((p) => {
        const nameMatch = !q || p.name.toLowerCase().includes(q);
        const categoryMatch = categoryFilter === "all" || String(p.categoryId) === categoryFilter;
        return nameMatch && categoryMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query, categoryFilter]);

  return (
    <div>
      <PageHeader title="Produkty">
        <Button variant="tonal" disabled>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj produkt (wkrótce)
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Input
          placeholder="Szukaj produktu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-64">
            <SelectValue placeholder="Filtr kategorii" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie kategorie</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProductsTable products={filteredProducts} categories={categories} />
    </div>
  );
}
