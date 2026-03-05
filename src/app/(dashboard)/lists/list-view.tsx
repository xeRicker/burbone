'use client';

import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfigStore } from "@/stores/use-config-store";
import { cn } from "@/lib/utils/cn";
import { format, parse } from 'date-fns';
import { pl } from 'date-fns/locale';

interface List {
  location: string;
  date: string;
  path: string;
}

interface Product {
    name: string;
    quantity: number;
}

interface ListDetails extends List {
    products: Product[];
}

export default function ListView({ lists }: { lists: List[] }) {
    const { locations } = useConfigStore();
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedList, setSelectedList] = useState<ListDetails | null>(null);

    const months = useMemo(() => {
        const monthSet = new Set<string>();
        lists.forEach(list => {
            try {
                const d = parse(list.date, 'dd.MM.yyyy', new Date());
                if (!isNaN(d.getTime())) monthSet.add(format(d, 'yyyy-MM'));
            } catch (e) {}
        });
        const sorted = Array.from(monthSet).sort().reverse();
        if (sorted.length > 0 && !selectedMonth) {
            setSelectedMonth(sorted[0]!);
        }
        return sorted;
    }, [lists, selectedMonth]);

    const filteredLists = useMemo(() => {
        if (!selectedMonth) return [];
        return lists.filter(list => {
            try {
                const d = parse(list.date, 'dd.MM.yyyy', new Date());
                return !isNaN(d.getTime()) && format(d, 'yyyy-MM') === selectedMonth;
            } catch (e) { return false; }
        });
    }, [lists, selectedMonth]);
    
    const handleViewClick = async (list: List) => {
        try {
            const response = await fetch(`/api/lists?location=${list.location}&date=${list.date}`);
            const data = await response.json();
            const productsArray = Array.isArray(data.products) ? data.products : Object.entries(data.products || {}).map(([name, quantity]) => ({ name, quantity }));
            setSelectedList({ ...list, products: productsArray });
        } catch (error) {
            console.error('Error fetching list details:', error);
        }
    };

    const getLocationConfig = (name: string) => locations.find(l => l.name === name);
    
    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-24">
            <header>
                <h1 className="headline-large text-primary">Archiwum List</h1>
                <p className="text-text-secondary body-medium">Przeglądaj historyczne listy zapotrzebowania</p>
            </header>

            <Card variant="filled" className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                <Icon name="calendar_month" className="text-text-secondary hidden sm:block" />
                <div className="w-full sm:w-auto">
                    <label htmlFor="monthFilter" className="label-small text-text-muted">WYBIERZ MIESIĄC:</label>
                    <select 
                        id="monthFilter" 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        value={selectedMonth}
                        className="w-full bg-bg-input h-12 px-4 rounded-lg outline-none title-medium cursor-pointer border border-border-default hover:border-primary transition-colors mt-1"
                    >
                        {months.map(m => (
                            <option key={m} value={m}>
                                {format(parse(m, 'yyyy-MM', new Date()), 'LLLL yyyy', { locale: pl }).toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLists.map((list, index) => {
                    const locConfig = getLocationConfig(list.location);
                    return (
                        <Card key={index} variant="outlined" className="p-4 flex flex-col justify-between gap-4">
                           <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${locConfig?.color || '#FF8C42'}20`, color: locConfig?.color || '#FF8C42' }}>
                                    <Icon name={locConfig?.icon || 'storefront'} size={20} />
                                </div>
                                <div>
                                    <h3 className="title-medium capitalize">{list.location}</h3>
                                    <p className="body-medium text-text-secondary">{list.date}</p>
                                </div>
                           </div>
                           <Button onClick={() => handleViewClick(list)} variant="filled" className="w-full gap-2">
                                <Icon name="visibility" />
                                Zobacz Listę
                           </Button>
                        </Card>
                    );
                })}
            </div>
            
            {filteredLists.length === 0 && (
                 <Card variant="outlined" className="p-12 border-dashed flex flex-col items-center justify-center text-text-muted col-span-full">
                    <Icon name="search_off" size={48} className="mb-4" />
                    <p>Brak list dla wybranego miesiąca.</p>
                </Card>
            )}

            <Dialog isOpen={!!selectedList} onClose={() => setSelectedList(null)} title={`Lista: ${selectedList?.location} - ${selectedList?.date}`}>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar -mr-4 pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedList?.products.map((p, i) => (
                             <Card key={i} variant="filled" className="p-3 flex items-center justify-between">
                                <span className="body-medium">{p.name}</span>
                                <span className="title-medium text-primary bg-primary-subtle px-3 py-1 rounded-full">{p.quantity}</span>
                            </Card>
                        ))}
                        {selectedList?.products.length === 0 && <p className="text-text-muted col-span-full text-center py-8">Brak produktów na tej liście.</p>}
                    </div>
                </div>
                <Button onClick={() => setSelectedList(null)} variant="outlined" className="w-full mt-6">Zamknij</Button>
            </Dialog>
        </div>
    );
}
