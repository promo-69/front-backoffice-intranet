import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu({ items }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 bg-[#F6AD38] rounded-full flex items-center justify-center"
      >
        <span className="text-white font-bold">≡</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg py-2 z-50">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
