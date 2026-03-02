import { PageHeader } from "@/components/layouts/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Ustawienia" />
      <Card>
        <CardContent className="p-6 text-text-secondary">
          Ustawienia globalne będą dostępne w kolejnym etapie. Ta strona została dodana,
          aby nawigacja nie prowadziła do błędu 404.
        </CardContent>
      </Card>
    </div>
  );
}
