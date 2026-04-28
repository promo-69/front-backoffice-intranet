import Badge from "../../../components/ui/Badge"
import { ImageOff, Edit, Eye, Trash } from "lucide-react"

export const ColumnsMovies = (onView, onEdit, onDelete) => [
  {
    accessorKey: "poster_url",
    header: "Poster",
    cell: ({ row }) => {
      const posterUrl = row.getValue("poster_url");

     
      if (!posterUrl) {
        return (
          <div className="w-12 h-16 rounded-md shadow-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <ImageOff size={20} strokeWidth={1} />
          </div>
        );
      }

      return (
        <img 
          src={posterUrl} 
          alt="Poster" 
          // Aplicamos el tamaño exacto solicitado
          className="w-12 h-16 object-cover rounded-md shadow-sm border border-slate-100"
        />
      );
    }
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => <span className="font-medium text-slate-900">{row.getValue("title")}</span>
  },
  {
    accessorKey: "age_classification",
    header: "Clasificación",
  },
  {
    accessorKey: "duration_minutes",
    header: "Duración",
    cell: ({ row }) => `${row.getValue("duration_minutes")} min`
  },
  {
    accessorKey: "state",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("state");
      
      const variants = {
        "Proximamente": "bg-green-100 text-green-600/80 ",
        "En Cartelera": "bg-blue-100 text-blue-600/80 ",
        "Evento Especial": "bg-yellow-100 text-yellow-600/80 border-yellow-200",
        "Finalizada": "bg-slate-100 text-slate-600/80 "
      };
      return <Badge className={`${variants[status]} border rounded-full px-3 py-2 text-base font-bold `}>{status}</Badge>;
    }
  },
  {
    id: "actions",
    header: () => <div className="text-left">Acciones</div>,
    cell: ({ row }) => {
      const movie = row.original;
      return (
        <div className="flex justify-end gap-2">
          <button onClick={() => onView(movie)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <Eye size={24} />
          </button>
          <button onClick={() => onEdit(movie)} className="p-2 hover:bg-slate-100 rounded-full text-blue-600">
            <Edit size={24} />
          </button>
          <button onClick={() => onDelete(movie)} className="p-2 hover:bg-slate-100 rounded-full text-red-600">
            <Trash size={24} />
          </button>
        </div>
      );
    }
  }
];