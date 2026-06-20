import { Wifi, WifiOff, Users } from "lucide-react";
import { useOccupancy } from "@/hooks/useOccupancy";
import { Skeleton } from "@/components/ui/skeleton";

function OccupancyBar({ pct }) {
  const color =
    pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className={`${color} h-2 rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export function LiveOccupancyPanel({ cinemaId }) {
  const { rooms, connected } = useOccupancy(cinemaId);

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
          Ocupación en tiempo real
        </h3>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {connected ? "En vivo" : "Conectando..."}
        </div>
      </div>

      {!cinemaId ? (
        <p className="text-sm text-muted-foreground">
          Selecciona una sucursal para ver ocupación en tiempo real.
        </p>
      ) : !connected && rooms.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay funciones activas en este momento.
        </p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const pct =
              room.capacity > 0
                ? Math.round((room.tickets_sold / room.capacity) * 100)
                : 0;

            return (
              <div key={room.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate max-w-[60%]">
                    {room.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {room.tickets_sold}/{room.capacity}
                    </span>
                    <span className="font-semibold text-foreground text-xs ml-1">
                      {pct}%
                    </span>
                  </div>
                </div>
                <OccupancyBar pct={pct} />
                {room.movie_title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {room.movie_title}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
