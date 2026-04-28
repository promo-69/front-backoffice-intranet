import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineBarChart,
  AiOutlineAppstore,
  AiOutlineLogout,
  AiOutlineVideoCamera,
  AiOutlineShop,
  AiOutlineTransaction,
  AiOutlineDatabase,
} from "react-icons/ai";
import Loguito from "../../assets/images/logotype/logoCiineflix.png"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#1d1430] text-white min-h-screen p-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
      <img src={Loguito} alt="logo" className="w-full mb-6 object-contain" />
      <div className="mb-8">
        <h1 className="text-sm font-bold leading-tight">
          Sistema administrativo
        </h1>
        <p className="text-sm text-gray-300 uppercase tracking-wide">
          Intranet
        </p>
      </div>
      <nav className="flex-1 space-y-4">
        <a
          href="/admin/dashboard"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineHome /> Dashboard
        </a>

        <a
          href="/admin/exhibition"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineVideoCamera /> Cartelera
        </a>

        <a
          href="/admin/sucursales"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineShop /> Sucursales
        </a>

        <a
          href="/admin/users"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineUser /> Usuarios
        </a>

        <a
          href="/admin/transacciones"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineTransaction /> Transacciones
        </a>

        <a
          href="/admin/inventario"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineDatabase /> Inventario
        </a>

        <a
          href="/admin/reports"
          className="flex items-center gap-3 hover:text-purple-400"
        >
          <AiOutlineBarChart /> Reportes
        </a>
      </nav>

      <a
        href="/login"
        className="mt-auto flex items-center gap-2 text-white hover:text-red-200"
      >
        <AiOutlineLogout />
        <span>
          <h1 className="text-base font-bold leading-tight">Cerrar sesión</h1>
        </span>
      </a>
    </aside>
  );
}
