'use client';

import * as React from 'react';
import Link from 'next/link';
import { RevenueCard } from '@/components/features/revenue-card';
import { EmployeeGrid } from '@/components/features/employee-grid';
import { ProductCategories } from '@/components/features/product-categories';
import { FAB } from '@/components/ui/fab';
import { Icon } from '@/components/ui/icon';
import { useReportStore } from '@/stores/use-report-store';
import { useConfigStore } from '@/stores/use-config-store';
import { format } from 'date-fns';

export default function GeneratorPage() {
  const { revenue, cardRevenue, employees, products, setLocation, reset } = useReportStore();
  const { locations, categories, isLoading } = useConfigStore();
  
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [reportText, setReportText] = React.useState('');

  const activeLocations = locations.filter(l => l.enabled);

  const generateReport = async (selectedLoc: string) => {
    setLocation(selectedLoc);
    const dateStr = format(new Date(), 'dd.MM.yyyy');
    let text = `🧾 ${selectedLoc} ${dateStr}\n`;

    const reportData: any = {
      location: selectedLoc,
      date: dateStr,
      revenue: parseFloat(revenue) || 0,
      cardRevenue: parseFloat(cardRevenue) || 0,
      employees: {},
      products: {}
    };

    const allEmployees = useConfigStore.getState().employees;

    // Employees
    (Object.entries(employees) as [string, { start: string; end: string }][]).forEach(([id, shift]) => {
      if (shift.start && shift.end) {
        const empName = allEmployees.find(e => e.id === id)?.name || id;
        text += `• ${empName}: ${shift.start} – ${shift.end}\n`;
        reportData.employees[id] = `${shift.start} – ${shift.end}`; // Save ID in report
      }
    });

    // Products
    categories.forEach((cat) => {
      if (!cat.enabled) return;
      let catTxt = "";
      cat.items.forEach(p => {
        if (!p.enabled) return;
        const qty = products[p.name] || 0;
        if (p.name.includes("Bułki") && qty === 0) {
          catTxt += `  • Bułki: ❌\n`;
          reportData.products[p.name] = 0;
        } else if (qty > 0) {
          catTxt += `  • ${p.name}${p.type === 's' ? '' : ': ' + qty}\n`;
          reportData.products[p.name] = qty;
        }
      });
      if (catTxt) text += `\n${cat.name}\n${catTxt}`;
    });

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
    } catch (e) {
      console.error("Failed to save report to server", e);
    }

    setReportText(text.trim());
    setShowLocationPicker(false);
    setShowSuccess(true);
    
    // Copy to clipboard
    navigator.clipboard.writeText(text.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-primary headline-small animate-pulse">ŁADOWANIE...</div>
      </div>
    );
  }

  const hasAnyData = Object.keys(products).length > 0 || 
                     Object.values(employees).some(e => e.start && e.end) || 
                     Number(revenue) > 0 || 
                     Number(cardRevenue) > 0;

  return (
    <main className="min-h-screen pb-20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-bg-base/80 backdrop-blur-md h-16 flex items-center justify-between px-4 border-b border-border-subtle">
        <h1 className="headline-small font-bold text-primary tracking-tight">GENERATOR LISTY</h1>
        <Link 
          href="/stats" 
          className="flex items-center gap-2 px-4 h-10 rounded-full bg-bg-elevated text-primary hover:bg-primary hover:text-on-primary transition-all label-large"
        >
          <span>ADMIN</span>
          <Icon name="admin_panel_settings" size={20} />
        </Link>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <RevenueCard />
        <EmployeeGrid />
        <ProductCategories />
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-4 px-6 z-20">
        {hasAnyData && (
          <button 
            onClick={reset}
            className="w-12 h-12 rounded-full bg-bg-elevated text-text-secondary flex items-center justify-center hover:text-error transition-colors"
          >
            <Icon name="delete_sweep" />
          </button>
        )}
        
        <FAB 
          variant="extended" 
          className="shadow-glow-primary gap-2"
          onClick={() => setShowLocationPicker(true)}
        >
          <Icon name="content_copy" />
          <span className="label-large">SKOPIUJ LISTĘ</span>
        </FAB>
      </div>

      {/* Location Picker Sheet */}
      {showLocationPicker && (
        <>
          <div 
            className="fixed inset-0 bg-scrim z-30 transition-opacity" 
            onClick={() => setShowLocationPicker(false)} 
          />
          <div className="fixed bottom-0 left-0 right-0 bg-bg-overlay rounded-t-[28px] p-6 z-40 animate-slide-up">
            <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-6" />
            <h3 className="headline-small mb-6 text-center">Wybierz punkt</h3>
            <div className="grid grid-cols-1 gap-3">
              {activeLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => generateReport(loc.name)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-bg-raised hover:bg-hover-overlay transition-all text-left border-l-4"
                  style={{ borderColor: loc.color }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${loc.color}20`, color: loc.color }}
                  >
                    <Icon name={loc.icon} size={24} />
                  </div>
                  <span className="title-medium uppercase">{loc.name}</span>
                </button>
              ))}
              {activeLocations.length === 0 && (
                <p className="text-center text-text-muted py-4">Brak aktywnych lokalizacji.</p>
              )}
              <button 
                onClick={() => setShowLocationPicker(false)}
                className="mt-2 p-4 text-text-secondary label-large hover:text-primary"
              >
                ANULUJ
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Dialog */}
      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-scrim z-50" onClick={() => setShowSuccess(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-sm bg-bg-overlay rounded-[28px] p-6 z-50 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-success-subtle text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" size={48} fill />
            </div>
            <h3 className="headline-small mb-2">LISTA GOTOWA!</h3>
            <p className="body-medium text-text-secondary mb-6">
              Skopiowano do schowka. Możesz teraz wkleić ją na Messengerze.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-primary text-on-primary h-12 rounded-full label-large"
            >
              SUPER!
            </button>
          </div>
        </>
      )}
    </main>
  );
}
