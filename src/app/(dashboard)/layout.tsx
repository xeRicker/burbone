import { Sidebar } from "@/components/navigation/sidebar";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { jsonDb } from "@/lib/json-db";

async function getAllData() {
  const [locations, employees, products, categories, reports] = await Promise.all([
    jsonDb.getLocations(),
    jsonDb.getEmployees(),
    jsonDb.getProducts(),
    jsonDb.getCategories(),
    jsonDb.getReports(),
  ]);
  return { locations, employees, products, categories, reports };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAllData();

  return (
    <>
      <StoreHydrator data={data} />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}
