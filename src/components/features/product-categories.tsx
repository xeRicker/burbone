'use client';

import { Card } from "@/components/ui/card";
import { useConfigStore } from "@/stores/use-config-store";
import { useReportStore } from "@/stores/use-report-store";
import { cn } from "@/lib/utils/cn";

import { Icon } from "@/components/ui/icon";

const M3_ICONS = ['star', 'fastfood', 'local_pizza', 'lunch_dining', 'set_meal', 'bakery_dining', 'kebab_dining', 'local_drink', 'shopping_bag', 'cleaning_services', 'inventory_2', 'payments', 'edit_note', 'eco', 'soup_kitchen'];

export function ProductCategories() {
  const allCategories = useConfigStore(state => state.categories);
  const categories = allCategories.filter(c => c.enabled);

  return (
    <div className="space-y-6 pb-24">
      {categories.map((cat) => (
        <section key={cat.id} className="space-y-3">
          <div className="flex items-center gap-2 ml-2" style={{ color: cat.color || '#FF8C42' }}>
            {M3_ICONS.includes(cat.icon) ? (
              <Icon name={cat.icon} size={28} />
            ) : (
              <span className="text-2xl">{cat.icon}</span>
            )}
            <h3 className="headline-small" style={{ color: cat.color || '#FF8C42' }}>{cat.name}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cat.items.filter(i => i.enabled).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProductCard({ item }: { item: { id: string; name: string; type: string } }) {
  const { products, toggleProduct } = useReportStore();
  const val = products[item.name] || 0;
  const isSelected = val > 0;

  if (item.type === 's') {
    return (
      <Card
        variant={isSelected ? "filled" : "outlined"}
        className={cn(
          "relative cursor-pointer select-none p-3 h-24 flex flex-col justify-between transition-colors",
          isSelected && "bg-primary-subtle border-primary shadow-glow-primary"
        )}
        onClick={() => toggleProduct(item.name)}
      >
        <span className={cn("body-medium line-clamp-2", isSelected ? "text-primary font-medium" : "text-text-primary")}>
          {item.name}
        </span>
        <div className="flex justify-end items-end h-full">
           <span className="material-symbols-rounded text-primary">
            {isSelected ? 'check_circle' : 'circle'}
           </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant={isSelected ? "filled" : "outlined"}
      className={cn(
        "p-3 h-24 flex flex-col justify-between transition-colors",
        isSelected && "bg-primary-subtle border-primary shadow-glow-primary"
      )}
    >
      <span className={cn("body-medium truncate", isSelected ? "text-primary font-medium" : "text-text-primary")}>
        {item.name}
      </span>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => toggleProduct(item.name, Math.max(0, val - 1))}
          className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-primary hover:bg-hover-overlay"
        >
          <span className="material-symbols-rounded">remove</span>
        </button>
        <span className="body-large font-bold">{val}</span>
        <button
          onClick={() => toggleProduct(item.name, val + 1)}
          className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-primary hover:bg-hover-overlay"
        >
          <span className="material-symbols-rounded">add</span>
        </button>
      </div>
    </Card>
  );
}
