import { AiOutlineUser } from "react-icons/ai";

export default function Header({ title = "Dashboard" }) {
  return (
    <header className="w-full bg-[#1d1430]/90 shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-[#F6AD38] font-['Montserrat']">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-white">Admin</span>
        <div className="w-8 h-8 bg-[#F6AD38] rounded-full flex items-center justify-center">
          <AiOutlineUser className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
}
