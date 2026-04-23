import HeaderCashier from "../../components/ticketOffice/HeaderCashier";
import { AiOutlineDollar, AiOutlineShopping, AiOutlineUser } from "react-icons/ai";
import { HiOutlineTicket } from "react-icons/hi";

export default function DashboardCashier() {
  const stats = [
    { label: "Ventas de Hoy", value: "$450.00", icon: <AiOutlineDollar />, color: "bg-green-500" },
    { label: "Boletos Emitidos", value: "124", icon: <HiOutlineTicket />, color: "bg-blue-500" },
    { label: "Productos Vendidos", value: "85", icon: <AiOutlineShopping />, color: "bg-orange-500" },
    { label: "Clientes Atendidos", value: "42", icon: <AiOutlineUser />, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat">
      <HeaderCashier title="Dashboard" />

      <main className="p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#F6AD38] mb-8">
          Bienvenido, Panel de Cajero
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[rgba(45,23,72,0.87)] p-6 rounded-2xl border border-white/10 shadow-lg hover:transform hover:scale-105 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[rgba(45,23,72,0.87)] p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#F6AD38] transition-colors cursor-pointer group">
            <div className="w-20 h-20 bg-[#F6AD38] rounded-full flex items-center justify-center text-4xl text-[#1d1430] group-hover:scale-110 transition-transform">
              <HiOutlineTicket />
            </div>
            <h3 className="text-xl font-bold text-[#F6AD38]">Venta de Boletos</h3>
            <p className="text-gray-400">Inicia una nueva venta de boletos por taquilla</p>
          </div>

          <div className="bg-[rgba(45,23,72,0.87)] p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#F6AD38] transition-colors cursor-pointer group">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-4xl text-white group-hover:scale-110 transition-transform">
              <AiOutlineShopping />
            </div>
            <h3 className="text-xl font-bold text-white">Confitería</h3>
            <p className="text-gray-400">Procesa ventas de productos de confitería</p>
          </div>
        </div>
      </main>
    </div>
  );
}