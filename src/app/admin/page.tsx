import { fetchAllData } from "@/lib/api"
import AdminDashboard from "./admin-dashboard"
import { GlassPanel } from "@/components/glass/glass-panel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  // RSC fetches data on server
  const data = await fetchAllData()

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-5 pb-16 space-y-6">
      <header className="flex justify-between items-center bg-surface p-5 rounded-md border border-[#333] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <h1 className="text-[22px] text-primary font-heading m-0">Panel Admina</h1>
        <Link href="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} /> Wróć
          </Button>
        </Link>
      </header>

      <AdminDashboard initialData={data} />
    </div>
  )
}
