import { useState } from "react";
import HeaderCashier from "../../components/ticketOffice/HeaderCashier";
import { AiOutlineMinus, AiOutlinePlus, AiOutlineCamera } from "react-icons/ai";
import { FaQrcode } from "react-icons/fa";
import MarioBrossImg from "../../assets/images/logotype/logoCineflix.png";

export default function SellTickets() {
  const [selectedBranch, setSelectedBranch] = useState("Barquisimeto");
  const [ticketCount, setTicketCount] = useState(2);
  const [confectioneryCount, setConfectioneryCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("pago_movil");

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const cols = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-10">
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#F6AD38] uppercase tracking-wider">
            Proceso de Pago
          </h1>
          <p className="text-gray-300 mt-2">
            Confirma tus asientos y completa tu compra en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[rgba(45,23,72,0.87)] rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-xl font-semibold text-[#F6AD38] mb-4 border-b border-white/10 pb-2">
                Detalles de boleto y selección de Asientos
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={MarioBrossImg} 
                  alt="Mario Bross" 
                  className="w-32 h-40 object-cover rounded-lg shadow-lg border border-white/20"
                />
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-[#F6AD38]">Mario Bross</h3>
                      <p className="text-sm text-gray-400">20 Mar, 8:00 pm | Sala 1 Tradicional</p>
                    </div>
                    <div className="bg-[#F6AD38] text-[#1d1430] px-4 py-1 rounded-md font-bold text-xl">
                      Total 25$
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    Selecciona la sucursal para conocer la disponibilidad y continuar con la compra
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="bg-[#2d1748] border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#F6AD38]"
                    >
                      <option>Barquisimeto</option>
                      <option>Caracas</option>
                      <option>Valencia</option>
                    </select>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 font-medium">Boletos Requeridos:</span>
                      <div className="flex items-center gap-3 bg-[#2d1748] rounded-full px-3 py-1 border border-white/20">
                        <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="text-[#F6AD38]">
                          <AiOutlineMinus />
                        </button>
                        <span className="font-bold w-4 text-center">{ticketCount}</span>
                        <button onClick={() => setTicketCount(ticketCount + 1)} className="text-[#F6AD38]">
                          <AiOutlinePlus />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[rgba(45,23,72,0.87)] rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#F6AD38]">Selecciona tu asiento</h2>
                <span className="text-xs text-[#F6AD38]">0/2 seleccionados</span>
              </div>
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px] flex flex-col items-center">
                  <div className="flex gap-1 ml-6 mb-2">
                    {cols.map(num => (
                      <span key={num} className="w-6 text-[10px] text-center text-gray-500">{num}</span>
                    ))}
                  </div>
                  {rows.map(row => (
                    <div key={row} className="flex gap-1 items-center mb-1">
                      <span className="w-6 text-[10px] text-[#F6AD38] font-bold">{row}</span>
                      {cols.map(col => {
                        let bgColor = "bg-[#713182]";
                        if (row === 'A' && (col === 2 || col === 3)) bgColor = "bg-[#F6AD38]";
                        if (col % 4 === 0) bgColor = "bg-gray-500";
                        return (
                          <button key={`${row}${col}`} className={`w-6 h-6 rounded-sm ${bgColor}`} />
                        );
                      })}
                    </div>
                  ))}
                  <div className="flex gap-6 mt-8 text-[10px] items-center text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#F6AD38] rounded-sm" /><span>Seleccionado</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#713182] rounded-sm" /><span>Disponibles</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-500 rounded-sm" /><span>Reservados</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[rgba(45,23,72,0.87)] rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-xl font-semibold text-[#F6AD38] mb-4">Productos Adicionales</h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center text-4xl">🍿</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">Confitería</h3>
                      <p className="text-xs text-gray-400">Combo amigos (2 Cotufas Grandes y 2 Refrescos)</p>
                    </div>
                    <div className="bg-[#F6AD38] text-[#1d1430] px-3 py-1 rounded font-bold">Total 25$</div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-gray-300">Cantidad:</span>
                    <div className="flex items-center gap-3 bg-[#2d1748] rounded-full px-3 py-1 border border-white/20">
                      <button onClick={() => setConfectioneryCount(Math.max(0, confectioneryCount - 1))} className="text-[#F6AD38]"><AiOutlineMinus /></button>
                      <span className="font-bold w-4 text-center">{confectioneryCount}</span>
                      <button onClick={() => setConfectioneryCount(confectioneryCount + 1)} className="text-[#F6AD38]"><AiOutlinePlus /></button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <section className="bg-[rgba(45,23,72,0.87)] rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-xl font-semibold text-[#F6AD38] mb-6 border-b border-white/20 pb-2">Resumen de Compra</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between font-bold text-[#F6AD38]"><span>Mario Bross (2x Boletos)</span><span>25$</span></div>
                <div className="pl-4 space-y-1 text-xs text-gray-300"><p>Asiento: A1, A2</p><p>Sucursal: Barquisimeto</p></div>
                <div className="flex justify-between py-2 border-t border-white/10 mt-4 font-bold text-[#F6AD38]"><span>Entrega en la misma sucursal</span><span>25$</span></div>
                <div className="pt-4 space-y-2 border-t border-white/20">
                  <div className="flex justify-between text-gray-300"><span>Subtotal</span><span className="text-[#F6AD38] font-bold">50$</span></div>
                  <div className="flex justify-between text-gray-300"><span>I.V.A</span><span className="text-[#F6AD38] font-bold">8$</span></div>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/20"><span className="text-[#F6AD38]">Total a Pagar</span><span className="text-[#F6AD38]">58$</span></div>
              </div>
            </section>

            <section className="bg-[rgba(45,23,72,0.87)] rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-xl font-semibold text-[#F6AD38] mb-6">Método de pago</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" checked={paymentMethod === "pago_movil"} onChange={() => setPaymentMethod("pago_movil")} className="accent-[#F6AD38]" />
                    <span className="text-[#F6AD38] font-bold">Pago Móvil</span>
                  </label>
                  <div className="flex items-start gap-4">
                    <p className="text-[10px] text-gray-400">Escanee el QR y rellene los campos</p>
                    <div className="bg-white p-1 rounded"><FaQrcode className="text-black text-2xl" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <input type="text" placeholder="Banco" className="w-full bg-gray-300 rounded px-2 py-1.5 text-black" />
                    <input type="text" value="58$" readOnly className="w-full bg-white rounded px-2 py-1.5 text-black font-bold" />
                    <input type="text" placeholder="Referencia" className="w-full bg-gray-300 rounded px-2 py-1.5 text-black" />
                    <input type="text" placeholder="Teléfono" className="w-full bg-gray-300 rounded px-2 py-1.5 text-black" />
                  </div>
                  <button className="w-full py-2 bg-white text-[#1d1430] font-bold rounded-lg text-xs flex items-center justify-center gap-2"><AiOutlineCamera /> Adjuntar soporte</button>
                </div>
                <div className="pt-6">
                  <button className="w-full py-3 bg-[#F6AD38] text-[#1d1430] font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(246,173,56,0.3)] hover:brightness-110 active:scale-95 transition-all">Pagar 58$</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
