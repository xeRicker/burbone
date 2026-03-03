'use client';

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfigStore } from "@/stores/use-config-store";
import { cn } from "@/lib/utils/cn";

const M3_ICONS = ['storefront', 'home', 'park', 'business', 'apartment', 'location_city', 'festival', 'beach_access', 'terrain', 'holiday_village'];
const COLORS = ['#FF8C42', '#42B4FF', '#FFD166', '#66D97A', '#FF6B6B', '#9b59b6', '#3498db', '#e67e22', '#1abc9c', '#e74c3c'];

export default function LocationsPage() {
  const { locations, updateLocation, addLocation } = useConfigStore();
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState<string | null>(null);
  
  const [formName, setFormName] = React.useState("");
  const [formIcon, setFormIcon] = React.useState(M3_ICONS[0]!);
  const [formColor, setFormColor] = React.useState(COLORS[0]!);

  const openAdd = () => {
    setFormName("");
    setFormIcon(M3_ICONS[0]!);
    setFormColor(COLORS[Math.floor(Math.random() * COLORS.length)]!);
    setIsAddOpen(true);
  };

  const openEdit = (loc: any) => {
    setFormName(loc.name);
    setFormIcon(M3_ICONS.includes(loc.icon) ? loc.icon : M3_ICONS[0]!);
    setFormColor(loc.color || COLORS[0]!);
    setIsEditOpen(loc.id);
  };

  const handleSaveAdd = () => {
    if (!formName) return;
    addLocation({
      id: crypto.randomUUID(),
      name: formName,
      icon: formIcon,
      color: formColor,
      enabled: true
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!formName || !isEditOpen) return;
    updateLocation(isEditOpen, { name: formName, icon: formIcon, color: formColor });
    setIsEditOpen(null);
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="headline-large text-primary">Lokalizacje</h1>
          <p className="text-text-secondary body-medium">Zarządzaj punktami sprzedaży</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Icon name="add" />
          Dodaj Punkt
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <Card key={loc.id} variant="filled" className="p-4 flex flex-col gap-4 border-l-4" style={{ borderColor: loc.color || '#FF8C42' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${loc.color}20`, color: loc.color }}
              >
                <Icon name={M3_ICONS.includes(loc.icon) ? loc.icon : 'location_on'} size={20} />
              </div>
              <span className="title-medium">{loc.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={cn(
                "label-medium font-medium px-2 py-0.5 rounded-full",
                loc.enabled ? "bg-success-subtle text-success" : "bg-bg-highest text-text-disabled"
              )}>
                {loc.enabled ? "AKTYWNY" : "WYŁĄCZONY"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLocation(loc.id, { enabled: !loc.enabled })}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-colors",
                    loc.enabled ? 'bg-primary' : 'bg-bg-highest'
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform",
                    loc.enabled ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
                <button onClick={() => openEdit(loc)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary ml-1">
                  <Icon name="edit" size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nowa Lokalizacja">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Nazwa</label>
            <input 
              value={formName} 
              onChange={e => setFormName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
              placeholder="np. Oświęcim"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Wybierz Ikonę</label>
            <div className="grid grid-cols-5 gap-2">
              {M3_ICONS.map(iconName => (
                <button
                  key={iconName}
                  onClick={() => setFormIcon(iconName)}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                    formIcon === iconName ? "bg-primary-subtle text-primary border border-primary" : "bg-bg-elevated text-text-secondary hover:bg-hover-overlay"
                  )}
                >
                  <Icon name={iconName} size={24} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Kolor wizytówki</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    formColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-bg-overlay" : ""
                  )}
                  style={{ backgroundColor: color }}
                >
                  {formColor === color && <Icon name="check" className="text-white" size={20} />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveAdd} className="w-full mt-6">Dodaj</Button>
        </div>
      </Dialog>

      <Dialog isOpen={!!isEditOpen} onClose={() => setIsEditOpen(null)} title="Edytuj Lokalizację">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Nazwa</label>
            <input 
              value={formName} 
              onChange={e => setFormName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Wybierz Ikonę</label>
            <div className="grid grid-cols-5 gap-2">
              {M3_ICONS.map(iconName => (
                <button
                  key={iconName}
                  onClick={() => setFormIcon(iconName)}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                    formIcon === iconName ? "bg-primary-subtle text-primary border border-primary" : "bg-bg-elevated text-text-secondary hover:bg-hover-overlay"
                  )}
                >
                  <Icon name={iconName} size={24} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Kolor wizytówki</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    formColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-bg-overlay" : ""
                  )}
                  style={{ backgroundColor: color }}
                >
                  {formColor === color && <Icon name="check" className="text-white" size={20} />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveEdit} className="w-full mt-6">Zapisz Zmiany</Button>
        </div>
      </Dialog>
    </div>
  );
}
