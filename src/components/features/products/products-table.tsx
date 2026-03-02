import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Product, Category } from "@/types/common";
import { MoreHorizontal } from "lucide-react";

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const getCategoryName = (categoryId: number) => categories.find((c) => c.id === categoryId)?.name || "Brak kategorii";

  return (
    <div className="rounded-md border border-border-subtle bg-bg-raised">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produkt</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-text-primary">
                <div className="flex items-center gap-3">
                  <Icon name={(product.icon as any) || "Package"} size={18} className="text-primary" />
                  {product.name}
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">{getCategoryName(product.categoryId)}</TableCell>
              <TableCell className="text-text-secondary">{product.type === "amount" ? "Ilość" : "Checkbox"}</TableCell>
              <TableCell className="text-right">
                <IconButton icon={MoreHorizontal} size="sm" variant="ghost" disabled />
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-text-muted py-8">
                Brak produktów dla wybranych filtrów.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
