import { useState, useEffect } from "react"
import { getCinemas } from "@/services/cinema.service"
import { moviesService } from "@/services/movie.service"
import { showtimesService } from "@/services/showtime.service"
import { getEmployees } from "@/services/employees.service"
import { getUsers } from "@/services/users.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Film, CalendarClock, Users, UserCog } from "lucide-react"

const statCards = [
  { key: "cinemas", label: "Sucursales", icon: Building2, color: "bg-blue-500" },
  { key: "movies", label: "Películas", icon: Film, color: "bg-purple-600" },
  { key: "showtimes", label: "Funciones", icon: CalendarClock, color: "bg-amber-500" },
  { key: "employees", label: "Empleados", icon: Users, color: "bg-emerald-500" },
  { key: "users", label: "Usuarios", icon: UserCog, color: "bg-rose-500" },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [cinemas, movies, showtimes, employees, users] = await Promise.all([
          getCinemas().then(r => Array.isArray(r.data) ? r.data.length : 0).catch(() => 0),
          moviesService.getAll().then(r => r.data?.length || 0).catch(() => 0),
          showtimesService.getAll().then(r => r.data?.length || 0).catch(() => 0),
          getEmployees().then(r => r?.length || 0).catch(() => 0),
          getUsers().then(r => r?.length || 0).catch(() => 0),
        ])
        setStats({ cinemas, movies, showtimes, employees, users })
      } catch (e) {
        console.error("Dashboard fetch error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {statCards.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="bg-white rounded-cineflix border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-brand-primary leading-tight font-montserrat">
              {loading ? <Skeleton className="h-7 w-10" /> : stats?.[key] ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
