import { fetchAllData, fetchEmployees, fetchLocations, fetchProducts } from "@/lib/api"
import AdminDashboard from "./admin-dashboard"
import { GlassPanel } from "@/components/glass/glass-panel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const data = await fetchAllData()
  const employees = await fetchEmployees()
  const locations = await fetchLocations()
  const products = await fetchProducts()

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-5 pb-16 space-y-6">
      <header className="flex justify-between items-center bg-surface p-5 rounded-[20px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-[22px] text-primary font-sans m-0 uppercase tracking-wide">Panel Admina</h1>
        <Link href="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} /> Wróć
          </Button>
        </Link>
      </header>

      <AdminDashboard 
        initialData={data} 
        initialEmployees={employees}
        initialLocations={locations}
        initialProducts={products}
      />
    </div>
  )
}
