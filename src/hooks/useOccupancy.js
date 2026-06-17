import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const WS_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "http://127.0.0.1:4000";

/**
 * HU-OPERATIVA-48: Ocupación en tiempo real por sucursal.
 * Se conecta al namespace /reports y escucha reports:occupancy-update.
 * Limpia la conexión al desmontar o cambiar cinemaId.
 */
export function useOccupancy(cinemaId) {
  const [rooms, setRooms] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!cinemaId) return;

    const socket = io(`${WS_URL}/reports`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("reports:subscribe-occupancy", { cinemaId });
    });

    socket.on("reports:occupancy-update", (data) => {
      if (data.cinemaId === cinemaId) {
        setRooms(data.rooms ?? []);
      }
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    return () => {
      socket.emit("reports:unsubscribe-occupancy", { cinemaId });
      socket.disconnect();
      setConnected(false);
      setRooms([]);
    };
  }, [cinemaId]);

  return { rooms, connected };
}
