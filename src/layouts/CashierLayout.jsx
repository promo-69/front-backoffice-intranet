import FunctionsPanel from "../components/ticketOffice/FunctionsPanel";
import ConfectioneryPanel from "../components/ticketOffice/ConfectioneryPanel";
import CartPanel from "../components/ticketOffice/CartPanel";
import HeaderCashier from "../components/ticketOffice/HeaderCashier";

export default function CashierLayout() {
  return (
    <div>
      <HeaderCashier title="Venta de boletos por taquilla" />
      <div className="grid grid-cols-3 gap-4 p-4 min-h-screen bg-gray-100">
        {/* Columna izquierda */}
        <div className="col-span-2 grid grid-rows-2 gap-4">
          {/* Sección superior izquierda (Funciones) */}
          <div className="row-span-1">
            <FunctionsPanel />
          </div>

          {/* Sección inferior izquierda (Confitería) */}
          <div className="row-span-1">
            <ConfectioneryPanel />
          </div>
        </div>

        {/* Columna derecha (Carrito) */}
        <div className="col-span-1">
          <CartPanel />
        </div>
      </div>
    </div>
  );
}