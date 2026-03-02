import { PageHeader } from "@/components/layouts/page-header";
import { getProducts } from "@/lib/db/queries/products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/features/products/products-table";

export default async function ProductsPage(props: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const products = await getProducts({ 
      query: searchParams.q, 
      category: searchParams.category 
    });

  return (
    <div>
      <PageHeader title="Produkty">
        <Button variant="tonal">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj produkt
        </Button>
      </PageHeader>
      
      {/* TODO: Add search and filter controls here */}

      <ProductsTable products={products} />
    </div>
  );
}
