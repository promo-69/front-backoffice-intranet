import { DataTable } from "@/components/admin/exhibition/TableMovies"
import { ColumnsMovies } from "./ColumnsMovies"

export function MoviesTab({ moviesData }) {
  // Handlers para las acciones
  const handleView = (movie) => console.log("Ver detalle:", movie.titulo);
  const handleEdit = (movie) => console.log("Editar:", movie.id);
  const handleDelete = (movie) => console.log("Eliminar:", movie.id);

  // Pasamos las funciones a la definición de columnas
  const movieCols = ColumnsMovies(handleView, handleEdit, handleDelete);

  return (
    <div className="mt-4">
      <DataTable columns={movieCols} data={moviesData} />
    </div>
  )
}