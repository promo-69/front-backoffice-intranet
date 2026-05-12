import { Edit, Trash2, Calendar, Clock } from "lucide-react";

export const ColumnsShowtimes = (onEdit, onDelete) => [
  {
    accessorKey: "movie_title",
    header: "Película",
    cell: ({ row }) => <span className="font-bold text-brand-primary">{row.original.movie_title}</span>
  },
  {
    accessorKey: "room_name",
    header: "Sala",
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-slate-400" />
        <span>{row.original.date}</span>
      </div>
    )
  },
  {
    header: "Horario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <Clock className="h-3 w-3 text-brand-gold" />
        <span>{row.original.start_time} - {row.original.end_time}</span>
      </div>
    )
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => <span className="font-bold text-green-600">${row.original.price}</span>
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => onEdit(row.original)} className="text-slate-400 hover:text-brand-primary"><Edit size={18}/></button>
        <button onClick={() => onDelete(row.original)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
      </div>
    )
  }
];