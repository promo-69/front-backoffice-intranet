import { useState, useEffect } from "react";
import { ArrowLeft, Info, Accessibility, Wrench } from "lucide-react";
import socketService from "../../services/socket.service";

const SOLD_SEATS_KEY = "cx_sold_seats";

function saveSoldSeats(showtimeId, seatIds) {
  try {
    const raw = localStorage.getItem(SOLD_SEATS_KEY) || "{}";
    const map = JSON.parse(raw);
    const existing = map[showtimeId] || [];
    map[showtimeId] = [...new Set([...existing, ...seatIds])];
    localStorage.setItem(SOLD_SEATS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export default function Step2Seats({ showtime, movie, seatMap, pricingMatrix = [], onNext, onBack }) {
  const [seats, setSeats] = useState(seatMap);
  const [ticketsNeeded, setTicketsNeeded] = useState(1);

  const selectedSeats = seats.filter((s) => s.status === "selected");
  const canContinue = selectedSeats.length === ticketsNeeded;

  const audienceCategories = [];
  const catSeen = new Set();
  for (const pm of pricingMatrix) {
    if (!catSeen.has(pm.audience_category.id)) {
      catSeen.add(pm.audience_category.id);
      audienceCategories.push(pm.audience_category);
    }
  }
  // Fallback si el backend no devuelve pricing_matrix
  if (audienceCategories.length === 0) {
    audienceCategories.push({ id: 1, name: "Adulto" }, { id: 2, name: "Niño" }, { id: 3, name: "Tercera Edad" });
  }

  function getSeatPrice(seat, audId) {
    const scId = seat.category?.id || 1;
    const entry = pricingMatrix.find(pm => pm.seat_category.id === scId && pm.audience_category.id === audId);
    return entry?.final_price ?? showtime.price;
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s, s.audienceCategoryId || 1), 0);

  useEffect(() => {
    const onSeatLockedOther = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.dbId === seatId && s.status !== "sold" ? { ...s, status: "sold" } : s))
      );
    };

    const onSeatUnlocked = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.dbId === seatId && s.status === "sold" ? { ...s, status: "available" } : s))
      );
    };

    const onSeatsUnlocked = ({ seatIds }) => {
      const idSet = new Set(seatIds);
      setSeats((prev) =>
        prev.map((s) => (idSet.has(s.dbId) && s.status === "sold" ? { ...s, status: "available" } : s))
      );
    };

    const onSeatsSoldFinal = ({ seats: seatIds }) => {
      const idSet = new Set(seatIds);
      setSeats((prev) =>
        prev.map((s) => (idSet.has(s.dbId) ? { ...s, status: "sold" } : s))
      );
    };

    socketService.on("seat_locked_by_other", onSeatLockedOther);
    socketService.on("seat_unlocked", onSeatUnlocked);
    socketService.on("seats_unlocked", onSeatsUnlocked);
    socketService.on("seats_sold_final", onSeatsSoldFinal);

    return () => {
      socketService.off("seat_locked_by_other", onSeatLockedOther);
      socketService.off("seat_unlocked", onSeatUnlocked);
      socketService.off("seats_unlocked", onSeatsUnlocked);
      socketService.off("seats_sold_final", onSeatsSoldFinal);
    };
  }, [showtime.id]);

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status === "sold" || seat.status === "maintenance") return;

    if (seat.status === "selected") {
      socketService.unlockSeat(seat.dbId);
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: "available" } : s))
      );
    } else {
      if (selectedSeats.length >= ticketsNeeded) return;
      socketService.lockSeatWithAck(seat.dbId).then(() => {
        setSeats((prev) =>
          prev.map((s) => (s.id === seatId ? { ...s, status: "selected", audienceCategoryId: 1 } : s))
        );
      }).catch(() => {
        setSeats((prev) =>
          prev.map((s) => (s.id === seatId ? { ...s, status: "sold" } : s))
        );
      });
    }
  };

  const resetSeats = () => {
    setSeats((prev) => {
      prev.filter(s => s.status === "selected").forEach(s => socketService.unlockSeat(s.dbId));
      return prev.map((s) => (s.status === "selected" ? { ...s, status: "available" } : s));
    });
  };

  const handleTicketCountChange = (val) => {
    const next = Math.max(1, Math.min(val, 8));
    setTicketsNeeded(next);
    resetSeats();
  };

  const gridRows = showtime.gridRows || 8;
  const gridCols = showtime.gridCols || 12;

  // Construye grid 2D a partir de la posición (row, col) de cada asiento
  const seatGrid = [];
  for (let r = 0; r < gridRows; r++) {
    seatGrid[r] = [];
    for (let c = 0; c < gridCols; c++) {
      seatGrid[r][c] = null;
    }
  }
  seats.forEach((s) => {
    const ri = s.row.charCodeAt(0) - 65;
    const ci = s.col - 1;
    if (ri >= 0 && ri < gridRows && ci >= 0 && ci < gridCols) {
      seatGrid[ri][ci] = s;
    }
  });

  // Precios calculados por getSeatPrice() vía selectedSeats

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#3E2186]">Selección de Asientos</h2>
          <p className="text-slate-600 text-sm mt-1">
            {movie.title} · {showtime.time} · {showtime.room}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#3E2186] font-bold text-2xl">${totalPrice.toFixed(2)}</p>
          <p className="text-slate-600 text-xs">{ticketsNeeded} boleto{ticketsNeeded > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Cantidad de boletos */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <span className="text-sm text-slate-700 font-medium">Cantidad de boletos:</span>
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
          <button
            onClick={() => handleTicketCountChange(ticketsNeeded - 1)}
            className="text-[#3E2186] font-bold w-5 h-5 flex items-center justify-center hover:scale-110 transition-transform"
          >−</button>
          <span className="font-bold w-6 text-center text-slate-800">{ticketsNeeded}</span>
          <button
            onClick={() => handleTicketCountChange(ticketsNeeded + 1)}
            className="text-[#3E2186] font-bold w-5 h-5 flex items-center justify-center hover:scale-110 transition-transform"
          >+</button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-300">
          <Info className="w-3 h-3" />
          <span>Selecciona exactamente {ticketsNeeded} asiento{ticketsNeeded > 1 ? "s" : ""}</span>
        </div>
        {selectedSeats.length > 0 && (
          <button onClick={resetSeats} className="ml-auto text-xs text-red-400 underline hover:text-red-300 transition-colors">
            Limpiar selección
          </button>
        )}
      </div>

      {/* PANTALLA */}
      <div className="flex flex-col items-center">
        <div className="w-3/4 h-2 bg-gradient-to-b from-[#3E2186]/60 to-transparent rounded-full mb-1" />
        <p className="text-[10px] text-[#3E2186]/60 uppercase tracking-widest mb-6 font-bold">Pantalla</p>

        {/* Grid de asientos */}
        <div className="flex justify-center overflow-x-auto w-full pb-4">
          <div className="min-w-max mx-auto">
            {/* Números de columna */}
            <div className="flex justify-center ml-8 mb-2">
              {Array.from({ length: gridCols }, (_, i) => (
                <span key={i + 1} className="w-10 text-[10px] text-center text-slate-500 font-mono">
                  {i + 1}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {seatGrid.map((row, ri) => (
                <div key={ri} className="flex items-center gap-2">
                  <span className="w-7 text-xs text-[#3E2186] font-bold text-center shrink-0">
                    {String.fromCharCode(65 + ri)}
                  </span>
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, 40px)`, gap: '0.5rem' }}
                  >
                    {row.map((seat, ci) => {
                      if (!seat) {
                        return (
                          <div
                            key={`e-${ri}-${ci}`}
                            className="w-10 h-10 bg-white border border-dashed border-slate-300 rounded-t-xl"
                          />
                        );
                      }
                      const isSelected = seat.status === "selected";
                      const isSold = seat.status === "sold";
                      const isMaintenance = seat.status === "maintenance";
                      const isDisabled = seat.category?.id === 2;
                      let colorClass, title, icon;
                      if (isMaintenance) {
                        colorClass = "bg-orange-500 text-white border-b-4 border-orange-700 cursor-not-allowed";
                        title = `${seat.id} — En Mantenimiento`;
                        icon = <Wrench className="w-3 h-3" />;
                      } else if (isSold) {
                        colorClass = "bg-gray-700/60 text-gray-400 border-b-4 border-gray-800/60 cursor-not-allowed opacity-60";
                        title = `${seat.id} — Vendido`;
                      } else if (isSelected) {
                        colorClass = "bg-[#F6AD38] text-[#1d1430] border-b-4 border-[#d48f2a] cursor-pointer scale-105 shadow-md shadow-[#F6AD38]/40";
                        title = `${seat.id} — Seleccionado`;
                      } else if (isDisabled) {
                        colorClass = "bg-blue-600 text-white border-b-4 border-blue-800 hover:bg-blue-500 cursor-pointer";
                        title = `${seat.id} — Discapacitados`;
                        icon = <Accessibility className="w-3 h-3" />;
                      } else {
                        colorClass = "bg-[#713182] text-white border-b-4 border-[#5a2668] hover:bg-[#913a9e] cursor-pointer hover:scale-105";
                        title = seat.id;
                      }
                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          title={title}
                          className={`w-10 h-10 rounded-t-xl transition-all duration-150 flex flex-col items-center justify-center text-[9px] font-bold ${colorClass}`}
                        >
                          <span>{seat.id}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#F6AD38] rounded-t-md border-b-2 border-[#d48f2a] flex items-center justify-center text-[10px]">✓</div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#713182] rounded-t-md border-b-2 border-[#5a2668] flex items-center justify-center text-white text-[10px]">◻</div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-t-md border-b-2 border-blue-800 flex items-center justify-center text-white"><Accessibility className="w-3 h-3" /></div>
            <span>Discapacitados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded-t-md border-b-2 border-orange-700 flex items-center justify-center text-white"><Wrench className="w-3 h-3" /></div>
            <span>Mantenimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-700/60 rounded-t-md border-b-2 border-gray-800/60 opacity-60" />
            <span>Vendido</span>
          </div>
        </div>
      </div>

      {/* Asientos seleccionados */}
      {selectedSeats.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-[#3E2186]/20 space-y-3">
          <p className="text-xs text-slate-600 font-semibold">Asientos seleccionados:</p>
          {selectedSeats.map((s) => {
            const seatPrice = getSeatPrice(s, s.audienceCategoryId || 1);
            return (
              <div key={s.id} className="flex items-center gap-3 flex-wrap">
                <span className="bg-[#F6AD38] text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs">
                  {s.id}
                </span>
                {audienceCategories.length > 0 ? (
                  <select
                    value={s.audienceCategoryId || 1}
                    onChange={(e) => {
                      const audId = Number(e.target.value);
                      setSeats((prev) =>
                        prev.map((seat) =>
                          seat.id === s.id ? { ...seat, audienceCategoryId: audId } : seat
                        )
                      );
                    }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#3E2186]"
                  >
                    {audienceCategories.map((ac) => (
                      <option key={ac.id} value={ac.id}>{ac.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-slate-500">Adulto</span>
                )}
                <span className="text-xs text-[#3E2186] font-bold">${seatPrice.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-slate-700 hover:border-gray-400 hover:text-slate-900 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <button
          onClick={() => onNext({
            selectedSeats: selectedSeats.map(s => ({
              ...s,
              audienceCategoryId: s.audienceCategoryId || 1,
            })),
            ticketsNeeded,
            totalPrice,
          })}
          disabled={!canContinue}
          className="
            px-8 py-3 bg-[#3E2186] text-white font-bold rounded-xl text-sm uppercase tracking-widest
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:brightness-110 active:scale-95 transition-all
            shadow-lg shadow-[#3E2186]/30
          "
        >
          Continuar → Confitería
        </button>
      </div>
    </div>
  );
}
