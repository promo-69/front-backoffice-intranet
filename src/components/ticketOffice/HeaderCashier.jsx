import { AiOutlineUser } from "react-icons/ai";
import Menu from "./Menu";
import Logo from "../../assets/images/logotype/logoCiineflix.png";

export default function HeaderCashier({ title }) {
  const menuItems = [
    { label: "Dashboard", path: "/ticketOffice/dashboard" },
    { label: "Venta de boletos por taquilla", path: "/ticketOffice/sell" },
    { label: "SALIR", path: "/login" },
  ];
  return (
    <header className="w-full bg-[#1d1430]/90 shadow px-6 py-4 flex justify-between items-center">
      <img src={Logo} alt="Logo" className="h-10" />
      <h1 className="text-xl font-semibold text-[#F6AD38] font-['Montserrat']">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-white">Cajero: Maria</span>
        <Menu items={menuItems} />
        <div className="w-8 h-8 bg-[#F6AD38] rounded-full flex items-center justify-center">
          <AiOutlineUser className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}