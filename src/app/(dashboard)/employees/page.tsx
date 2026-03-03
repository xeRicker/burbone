'use client';

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfigStore } from "@/stores/use-config-store";
import { cn } from "@/lib/utils/cn";

const COLORS = ['#FF8C42', '#42B4FF', '#FFD166', '#66D97A', '#FF6B6B', '#9b59b6', '#3498db', '#e67e22'];

export default function EmployeesPage() {
  const { employees, updateEmployee, addEmployee } = useConfigStore();
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState<string | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formRate, setFormRate] = React.useState(29);
  const [formColor, setFormColor] = React.useState(COLORS[0]);

  const openAdd = () => {
    setFormName("");
    setFormRate(29);
    setFormColor(COLORS[Math.floor(Math.random() * COLORS.length)]!);
    setIsAddOpen(true);
  };

  const openEdit = (emp: any) => {
    setFormName(emp.name);
    setFormRate(emp.rate);
    setFormColor(emp.color);
    setIsEditOpen(emp.id);
  };

  const handleSaveAdd = () => {
    if (!formName) return;
    addEmployee({
      id: crypto.randomUUID(),
      name: formName,
      rate: formRate,
      color: formColor || COLORS[0]!,
      enabled: true
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!formName || !isEditOpen) return;
    updateEmployee(isEditOpen, { name: formName, rate: formRate, color: formColor });
    setIsEditOpen(null);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="headline-large text-primary">Ekipa</h1>
          <p className="text-text-secondary body-medium">Zarządzaj pracownikami i stawkami</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Icon name="person_add" />
          Dodaj Pracownika
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id} variant="elevated" className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: emp.color }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <h3 className="body-large font-medium">{emp.name}</h3>
                  <span className="text-text-muted text-[11px]">{emp.rate} zł/h</span>
                </div>
              </div>
              
              <button 
                onClick={() => updateEmployee(emp.id, { enabled: !emp.enabled })}
                className={cn(
                  "w-10 h-5 rounded-full p-0.5 transition-colors",
                  emp.enabled ? 'bg-primary' : 'bg-bg-highest'
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  emp.enabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                emp.enabled ? "bg-success-subtle text-success" : "bg-bg-highest text-text-disabled"
              )}>
                {emp.enabled ? "AKTYWNY" : "WYŁĄCZONY"}
              </span>
              
              <button 
                onClick={() => openEdit(emp)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary"
                title="Edytuj"
              >
                <Icon name="edit" size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card variant="outlined" className="p-12 border-dashed flex flex-col items-center justify-center text-text-muted">
          <Icon name="group_off" size={48} className="mb-4" />
          <p>Brak pracowników w bazie.</p>
        </Card>
      )}

      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nowy Pracownik">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Imię</label>
            <input 
              value={formName} onChange={e => setFormName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
              placeholder="np. Jan"
            />
          </div>
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Stawka godzinowa (PLN)</label>
            <input 
              type="number" value={formRate} onChange={e => setFormRate(parseFloat(e.target.value))} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Kolor profilu</label>
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

      <Dialog isOpen={!!isEditOpen} onClose={() => setIsEditOpen(null)} title="Edytuj Pracownika">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Imię</label>
            <input 
              value={formName} onChange={e => setFormName(e.target.value)} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
            />
          </div>
          <div className="space-y-1">
            <label className="label-small text-text-secondary">Stawka godzinowa (PLN)</label>
            <input 
              type="number" value={formRate} onChange={e => setFormRate(parseFloat(e.target.value))} 
              className="w-full bg-bg-input h-14 px-4 rounded-md border-b border-border-default focus:border-primary transition-colors outline-none body-large"
            />
          </div>
          <div className="space-y-2">
            <label className="label-small text-text-secondary">Kolor profilu</label>
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
