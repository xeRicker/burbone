"use client";

import { useDataStore } from "@/stores/data-store";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
    const { categories } = useDataStore();

    return (
        <div>
            <PageHeader title="Kategorie produktów">
                <Button variant="tonal" disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj kategorię (wkrótce)
                </Button>
            </PageHeader>
            <Card>
                <CardContent className="p-6">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="p-4 bg-bg-raised rounded-lg text-center">
                                <p className="text-text-primary font-medium">{cat.name}</p>
                            </div>
                        ))}
                    </div>
                    {categories.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            <p>Brak zdefiniowanych kategorii.</p>
                            <p className="text-sm">Możesz je zaimportować z danych legacy.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
