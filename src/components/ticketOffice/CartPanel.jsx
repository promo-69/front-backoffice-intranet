export default function CartPanel() {
  return (
    <div className="bg-[rgba(45,23,72,0.87)] rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-[#F6AD38] mb-3">
        Carrito de compras
      </h2>

      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="p-3 bg-gray-100 rounded">Item 1</div>
        <div className="p-3 bg-gray-100 rounded">Item 2</div>
      </div>

      <button className="mt-4 bg-[#F6AD38] text-white py-2 rounded hover:bg-green-700">
        Finalizar venta
      </button>
    </div>
  );
}
