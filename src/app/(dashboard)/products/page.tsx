'use client';

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfigStore } from "@/stores/use-config-store";
import { cn } from "@/lib/utils/cn";

const M3_ICONS = ['star', 'fastfood', 'local_pizza', 'lunch_dining', 'set_meal', 'bakery_dining', 'kebab_dining', 'local_drink', 'shopping_bag', 'cleaning_services', 'inventory_2', 'payments', 'edit_note', 'eco', 'soup_kitchen'];
const COLORS = ['#FF8C42', '#42B4FF', '#FFD166', '#66D97A', '#FF6B6B', '#9b59b6', '#3498db', '#e67e22', '#1abc9c', '#e74c3c'];

export default function ProductsPage() {
  const { categories, updateCategory, addCategory, moveCategory, updateProduct, addProduct } = useConfigStore();

  const [isCatOpen, setIsCatOpen] = React.useState(false);
  const [editCatId, setEditCatId] = React.useState<string | null>(null);
  const [formCatName, setFormCatName] = React.useState("");
  const [formCatIcon, setFormCatIcon] = React.useState(M3_ICONS[0]!);
  const [formCatColor, setFormCatColor] = React.useState(COLORS[0]!);

  const [isProdOpen, setIsProdOpen] = React.useState<string | null>(null); // holds category ID for Add
  const [editProdId, setEditProdId] = React.useState<string | null>(null); // holds product ID for Edit
  const [formProdName, setFormProdName] = React.useState("");
  const [formProdType, setFormProdType] = React.useState<"s" | "">("");

  const openAddCat = () => {
    setEditCatId(null);
    setFormCatName("");
    setFormCatIcon(M3_ICONS[0]!);
    setFormCatColor(COLORS[Math.floor(Math.random() * COLORS.length)]!);
    setIsCatOpen(true);
  };

  const openEditCat = (cat: any) => {
    setEditCatId(cat.id);
    setFormCatName(cat.name);
    setFormCatIcon(M3_ICONS.includes(cat.icon) ? cat.icon : M3_ICONS[0]!);
    setFormCatColor(cat.color || COLORS[0]!);
    setIsCatOpen(true);
  };

  const handleSaveCat = () => {
    if (!formCatName) return;
    if (editCatId) {
      updateCategory(editCatId, { name: formCatName, icon: formCatIcon, color: formCatColor });
    } else {
      addCategory({
        id: crypto.randomUUID(),
        name: formCatName,
        icon: formCatIcon,
        color: formCatColor,
        enabled: true,
        items: []
      });
    }
    setIsCatOpen(false);
  };

  const openAddProd = (catId: string) => {
    setEditProdId(null);
    setIsProdOpen(catId);
    setFormProdName("");
    setFormProdType("");
  };

  const openEditProd = (catId: string, item: any) => {
    setIsProdOpen(catId);
    setEditProdId(item.id);
    setFormProdName(item.name);
    setFormProdType(item.type);
  };

  const handleSaveProd = () => {
    if (!formProdName || !isProdOpen) return;
    
    if (editProdId) {
      updateProduct(isProdOpen, editProdId, { name: formProdName, type: formProdType });
    } else {
      addProduct(isProdOpen, {
        id: crypto.randomUUID(),
        name: formProdName,
        type: formProdType,
        enabled: true
      });
    }
    setIsProdOpen(null);
    setEditProdId(null);
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="headline-large text-primary">Produkty</h1>
          <p className="text-text-secondary body-medium">Zarządzaj asortymentem i kategoriami</p>
        </div>
        <Button onClick={openAddCat} className="gap-2">
          <Icon name="create_new_folder" />
          <span className="hidden sm:inline">Dodaj Kategorię</span>
        </Button>
      </header>

      <div className="space-y-4">
        {categories.map((cat, index) => (
          <section key={cat.id} className="space-y-3">
            <Card variant="filled" className="p-3 bg-bg-raised flex flex-col sm:flex-row sm:items-center justify-between border-l-4 gap-3" style={{ borderColor: cat.color || '#FF8C42' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color || '#FF8C42' }}>
                  <Icon name={cat.icon.length > 20 || !M3_ICONS.includes(cat.icon) ? 'inventory_2' : cat.icon} size={20} />
                </div>
                <div>
                   <h2 className="title-medium text-primary">{cat.name}</h2>
                   <span className="text-text-muted label-small">{cat.items.length} produktów</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => moveCategory(index, 'up')}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Przesuń w górę"
                >
                  <Icon name="arrow_upward" size={18} />
                </button>
                <button 
                  onClick={() => moveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Przesuń w dół"
                >
                  <Icon name="arrow_downward" size={18} />
                </button>
                
                <div className="w-px h-6 bg-border-subtle mx-1" />

                 <button 
                  onClick={() => updateCategory(cat.id, { enabled: !cat.enabled })}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-colors mx-1",
                    cat.enabled ? 'bg-primary' : 'bg-bg-highest'
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform",
                    cat.enabled ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
                <button 
                  onClick={() => openEditCat(cat)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary"
                  title="Edytuj kategorię"
                >
                  <Icon name="edit" size={18} />
                </button>
                <button 
                  onClick={() => openAddProd(cat.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-container text-on-primary-container ml-1"
                  title="Dodaj produkt do tej kategorii"
                >
                  <Icon name="add" size={18} />
                </button>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ml-2 sm:ml-4 lg:ml-6">
              {cat.items.map((item) => (
                <Card key={item.id} variant="outlined" className={cn(
                  "p-2 px-3 flex items-center justify-between transition-opacity",
                  !item.enabled && "opacity-50"
                )}>
                  <div className="flex flex-col">
                    <span className="body-medium font-medium">{item.name}</span>
                    <span className="label-small text-text-muted flex items-center gap-1">
                      <Icon name={item.type === 's' ? "check_box" : "tag"} size={16} />
                      {item.type === 's' ? "Tylko wybór" : "Z ilością"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateProduct(cat.id, item.id, { enabled: !item.enabled })}
                      className={cn(
                        "w-8 h-4 rounded-full p-0.5 transition-colors",
                        item.enabled ? 'bg-primary' : 'bg-bg-highest'
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 bg-white rounded-full transition-transform",
                        item.enabled ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                    <button 
                      onClick={() => openEditProd(cat.id, item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary ml-1"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                  </div>
                </Card>
              ))}
              
              {cat.items.length === 0 && (
                <div className="col-span-full py-4 text-center text-text-disabled border border-dashed border-border-subtle rounded-xl">
                  Brak produktów w tej kategorii.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {categories.length === 0 && (
        <Card variant="outlined" className="p-12 border-dashed flex flex-col items-center justify-center text-text-muted">
          <Icon name="inventory" size={48} className="mb-4" />
          <p>Brak kategorii produktów.</p>
        </Card>
      )}

      {/* Dialog for Category */}
      <Dialog isOpen={isCatOpen} onClose={() => setIsCatOpen(false)} title={editCatId ? "Edytuj Kategorię" : "Nowa Kategoria"}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Nazwa kategorii</label>
            <input 
              value={formCatName} onChange={e => setFormCatName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
              placeholder="np. Burgery"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Wybierz Ikonę</label>
            <div className="grid grid-cols-5 gap-2">
              {M3_ICONS.map(iconName => (
                <button
                  key={iconName}
                  onClick={() => setFormCatIcon(iconName)}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                    formCatIcon === iconName ? "bg-primary-subtle text-primary border border-primary" : "bg-bg-elevated text-text-secondary hover:bg-hover-overlay"
                  )}
                >
                  <Icon name={iconName} size={24} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Wybierz Kolor</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormCatColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    formCatColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-bg-overlay" : ""
                  )}
                  style={{ backgroundColor: color }}
                >
                  {formCatColor === color && <Icon name="check" className="text-white" size={20} />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveCat} className="w-full mt-6">{editCatId ? "Zapisz Zmiany" : "Dodaj Kategorię"}</Button>
        </div>
      </Dialog>

      {/* Dialog for Product */}
      <Dialog isOpen={!!isProdOpen} onClose={() => { setIsProdOpen(null); setEditProdId(null); }} title={editProdId ? "Edytuj Produkt" : "Nowy Produkt"}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Nazwa produktu</label>
            <input 
              value={formProdName} onChange={e => setFormProdName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
              placeholder="np. Drwal"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Typ (odznaczanie vs ilość)</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-bg-elevated rounded-lg flex-1 border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary-subtle transition-all">
                <input 
                  type="radio" 
                  name="prodType" 
                  checked={formProdType === ''} 
                  onChange={() => setFormProdType('')} 
                  className="hidden"
                />
                <Icon name="tag" size={20} className={formProdType === '' ? 'text-primary' : 'text-text-muted'} />
                <span className={formProdType === '' ? 'text-primary font-medium' : 'text-text-secondary'}>Z ilością</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-bg-elevated rounded-lg flex-1 border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary-subtle transition-all">
                <input 
                  type="radio" 
                  name="prodType" 
                  checked={formProdType === 's'} 
                  onChange={() => setFormProdType('s')} 
                  className="hidden"
                />
                <Icon name="check_box" size={20} className={formProdType === 's' ? 'text-primary' : 'text-text-muted'} />
                <span className={formProdType === 's' ? 'text-primary font-medium' : 'text-text-secondary'}>Tylko wybór</span>
              </label>
            </div>
          </div>
          <Button onClick={handleSaveProd} className="w-full mt-6">{editProdId ? "Zapisz Zmiany" : "Dodaj Produkt"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
