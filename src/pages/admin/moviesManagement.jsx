import MovieCard from "../../components/movies/MovieCard";
import { LuPlus } from "react-icons/lu";

export default function MoviesManagement() {
  // Mock de datos para visualización
  const movies = [
    {
      id: 1,
      title: "Super Mario Galaxy. La película",
      description: "Un fontanero viaja a través de un laberinto subterráneo con su hermano.",
      genres: ["Animación", "Aventura"],
      time: "1h 32m",
      imageUrl: "https://via.placeholder.com/160x157"
    },

  ];

  const handleEdit = (id) => console.log("Editando película:", id);
  const handleDelete = (id) => console.log("Eliminando película:", id);

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de acciones superior */}
      <div className="flex justify-between items-center">
        <button className="flex items-center gap-2 bg-[#CC7AD3] text-black px-4 py-2 rounded-xl font-montserrat font-bold hover:bg-[#D89CDE] transition-colors shadow-sm">
          <LuPlus size={20} />
          Agregar Película
        </button>
      </div>

      {/* Grid de Películas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}