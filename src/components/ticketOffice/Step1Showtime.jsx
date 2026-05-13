import { useState } from "react";
import { Clock, MonitorPlay, DollarSign, Users } from "lucide-react";

export default function Step1Showtime({ movies, getShowtimes, onNext }) {
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

  const showtimes = selectedMovieId ? getShowtimes(selectedMovieId) : [];
  const selectedMovie = movies.find((m) => m.id === selectedMovieId);
  const selectedShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  const canContinue = selectedMovieId && selectedShowtimeId;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-[#F6AD38] mb-1">Selecciona una Película</h2>
        <p className="text-gray-400 text-sm">Elige la película que desea ver el cliente</p>
      </div>

      {/* GRID DE PELÍCULAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {movies.map((movie) => {
          const isSelected = selectedMovieId === movie.id;
          return (
            <button
              key={movie.id}
              onClick={() => { setSelectedMovieId(movie.id); setSelectedShowtimeId(null); }}
              className={`
                relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 group
                ${isSelected
                  ? "border-[#F6AD38] shadow-lg shadow-[#F6AD38]/20 scale-[1.02]"
                  : "border-white/10 hover:border-[#F6AD38]/50 hover:scale-[1.01]"
                }
              `}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/300x450/231640/F6AD38?text=🎬"; }}
              />
              <div className="bg-[rgba(29,20,48,0.95)] p-3">
                <p className="font-bold text-white text-sm leading-tight">{movie.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{movie.genre} · {movie.duration} min</p>
                <span className="inline-block mt-1 text-[9px] border border-[#F6AD38]/50 text-[#F6AD38] px-1.5 py-0.5 rounded font-bold">
                  {movie.rating}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-[#F6AD38] text-[#1d1430] rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* FUNCIONES DISPONIBLES */}
      {selectedMovieId && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-lg font-bold text-[#F6AD38] mb-3">
            Funciones disponibles — <span className="text-white">{selectedMovie?.title}</span>
          </h3>
          {showtimes.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay funciones disponibles para hoy.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {showtimes.map((show) => {
                const isSelected = selectedShowtimeId === show.id;
                const isSoldOut = show.available_seats === 0;
                return (
                  <button
                    key={show.id}
                    onClick={() => !isSoldOut && setSelectedShowtimeId(show.id)}
                    disabled={isSoldOut}
                    className={`
                      text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${isSoldOut ? "border-gray-700 opacity-40 cursor-not-allowed" : ""}
                      ${isSelected && !isSoldOut ? "border-[#F6AD38] bg-[#F6AD38]/10 shadow-md shadow-[#F6AD38]/20" : ""}
                      ${!isSelected && !isSoldOut ? "border-white/10 hover:border-[#F6AD38]/50 bg-white/5" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#F6AD38]" />
                      <span className="font-bold text-white text-lg">{show.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <MonitorPlay className="w-3 h-3" />
                      <span>{show.room}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{isSoldOut ? "Agotado" : `${show.available_seats} disponibles`}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#F6AD38] font-bold text-sm">
                        <DollarSign className="w-3 h-3" />
                        {show.price.toFixed(2)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BOTÓN CONTINUAR */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => onNext({ movie: selectedMovie, showtime: selectedShowtime })}
          disabled={!canContinue}
          className="
            px-8 py-3 bg-[#F6AD38] text-[#1d1430] font-bold rounded-xl
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:brightness-110 active:scale-95 transition-all
            shadow-lg shadow-[#F6AD38]/30 text-sm uppercase tracking-widest
          "
        >
          Continuar → Elegir Asientos
        </button>
      </div>
    </div>
  );
}
