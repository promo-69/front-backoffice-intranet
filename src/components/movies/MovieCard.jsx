import { Pencil, Trash2, Clock } from "react-icons";
import Card from "../ui/Card";
import IconButton from "../ui/IconButton"; 
import GenreBadge from "../ui/Badge";

export default function MovieCard({ movie, onEdit, onDelete }) {
  const { id, title, description, genres, time, imageUrl } = movie;

  const actions = (
    <>
      <IconButton 
        icon={Pencil} 
        label="Editar" 
        onClick={() => onEdit?.(id)} 
      />
      <IconButton 
        icon={Trash2} 
        label="Eliminar" 
        colorClass="text-red-600"
        onClick={() => onDelete?.(id)} 
      />
    </>
  );

  const media = imageUrl ? (
    <img
      src={imageUrl}
      alt={title}
      className="w-full aspect-[160/157] h-full object-cover rounded-sm"
    />
  ) : (
    <div className="w-full aspect-[160/157] 
    	h-full bg-[#2E1E51] flex items-center justify-center rounded-sm"
      aria-label="Imagen de Película"
		/>
  )

	const tags = genres?.map((genre) => (
		<Badge key = {genre}>
			{genre}
		</Badge>
	))

	const footer = time && (
        <div className="flex items-center gap-1.5 text-black">
          <Clock size={16} />
          <span className="text-xs font-montserrat font-semibold">{time}</span>
        </div>
      )

  return (
    <Card
      actionSlot={actions}
      title={title}
      description={description}
      media={media}
      tags={tags}
      footer={footer}
    />
  );
}