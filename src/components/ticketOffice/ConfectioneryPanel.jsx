export default function ConfectioneryPanel() {
  return (
    <div className="bg-[rgba(45,23,72,0.87)] rounded-lg shadow p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-[#F6AD38] mb-3">Confitería</h2>

      {/* Productos */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-100 rounded">Combo 1</div>
        <div className="p-3 bg-gray-100 rounded">Combo 2</div>
        <div className="p-3 bg-gray-100 rounded">Combo 3</div>
      </div>
    </div>
  );
}
