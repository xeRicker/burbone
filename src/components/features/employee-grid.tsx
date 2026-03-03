'use client';

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/use-config-store";
import { useReportStore } from "@/stores/use-report-store";
import { TIME_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export function EmployeeGrid() {
  const allEmployees = useConfigStore(state => state.employees);
  const employees = allEmployees.filter(e => e.enabled);
  const { employees: reportEmployees, setEmployeeShift } = useReportStore();

  const [activeEmpId, setActiveEmpId] = React.useState<string | null>(null);
  const [isCustomTimeOpen, setIsCustomTimeOpen] = React.useState(false);
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');

  const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const chars = cleaned.split('');
    if (chars.length > 2) {
      chars.splice(2, 0, ':');
    }
    setter(chars.join('').slice(0, 5));
  };

  if (employees.length === 0) return null;

  const activeEmpConfig = employees.find(e => e.id === activeEmpId);

  return (
    <>
      <Card className="p-4 space-y-4" variant="elevated">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-rounded">groups</span>
          <h2 className="title-large">EKIPA</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {employees.map((emp) => {
            const shift = reportEmployees[emp.id] || { start: '', end: '' };
            const isActive = shift.start && shift.end;

            return (
              <div
                key={emp.id}
                onClick={() => setActiveEmpId(emp.id)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                  isActive ? "bg-primary-subtle border-primary" : "bg-bg-raised hover:border-border-hover"
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${emp.color}20`, color: emp.color }} 
                  >
                    <Icon name="person" size={20} />
                  </div>
                  <span className={cn("body-large", isActive ? "text-primary font-bold" : "text-text-primary")}>
                    {emp.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <div className="px-4 py-2 bg-bg-elevated rounded-full flex items-center gap-2">
                      <Icon name="schedule" size={18} className="text-primary" />
                      <span className="body-medium font-medium tracking-wide">
                        {shift.start} - {shift.end}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                      <Icon name="add" size={20} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog isOpen={!!activeEmpId} onClose={() => { setActiveEmpId(null); setIsCustomTimeOpen(false); }} title={`Wybierz godziny: ${activeEmpConfig?.name || ''}`}>
        <div className="space-y-6">
          {isCustomTimeOpen ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <input
                    value={customStart}
                    onChange={(e) => handleTimeChange(setCustomStart, e.target.value)}
                    placeholder="HH:MM"
                    className="w-full bg-bg-input h-14 px-4 rounded-md border-b-2 border-border-default focus:border-primary transition-colors outline-none body-large text-center tracking-widest"
                />
                <span className="text-text-muted pb-2">-</span>
                <input
                    value={customEnd}
                    onChange={(e) => handleTimeChange(setCustomEnd, e.target.value)}
                    placeholder="HH:MM"
                    className="w-full bg-bg-input h-14 px-4 rounded-md border-b-2 border-border-default focus:border-primary transition-colors outline-none body-large text-center tracking-widest"
                />
              </div>
              <Button
                  onClick={() => {
                      if (activeEmpId && customStart.match(/^\d{2}:\d{2}$/) && customEnd.match(/^\d{2}:\d{2}$/)) {
                          setEmployeeShift(activeEmpId, customStart, customEnd);
                          setActiveEmpId(null);
                          setIsCustomTimeOpen(false);
                      }
                  }}
                  className="w-full"
                  disabled={!customStart.match(/^\d{2}:\d{2}$/) || !customEnd.match(/^\d{2}:\d{2}$/)}
              >
                  Zapisz godziny
              </Button>
              <Button variant="text" onClick={() => setIsCustomTimeOpen(false)}>Anuluj</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {TIME_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => {
                      if (activeEmpId) {
                        const [s, e] = p.value.split('-');
                        setEmployeeShift(activeEmpId, s!, e!);
                        setActiveEmpId(null);
                      }
                    }}
                    className="h-12 bg-bg-raised hover:bg-primary-subtle hover:text-primary border border-border-subtle rounded-lg flex items-center justify-center title-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => { setCustomStart(''); setCustomEnd(''); setIsCustomTimeOpen(true); }}
                  className="h-12 bg-bg-elevated hover:bg-primary-subtle hover:text-primary border border-border-default rounded-lg flex items-center justify-center title-medium transition-colors col-span-2 gap-2"
                >
                  <Icon name="schedule" />
                  Ustaw własny
                </button>
              </div>

              {reportEmployees[activeEmpId || '']?.start && (
                <div className="pt-4 border-t border-border-subtle">
                  <Button 
                    variant="outlined" 
                    className="w-full text-error border-error hover:bg-error-subtle"
                    onClick={() => {
                      if (activeEmpId) {
                        setEmployeeShift(activeEmpId, '', '');
                        setActiveEmpId(null);
                      }
                    }}
                  >
                    Usuń zmiany
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
