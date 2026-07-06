import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { getCustomers } from "@/services/customers.service";
import ClientsTable from "@/components/admin/customers/ClientsTable";
import EditCustomerModal from "@/components/admin/customers/EditCustomerModal";
import SuccessModal from "@/components/ui/SuccessModal";

export default function CustomersPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editTarget, setEditTarget] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setClients(Array.isArray(data) ? data : (data?.rows ?? []));
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = clients.filter((c) => {
    if (!c?.person) return false;
    const fullName =
      `${c.person.first_name} ${c.person.last_name}`.toLowerCase();
    const doc = (c.person.document_number ?? "").toString().toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || doc.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClose = (shouldRefresh) => {
    setEditTarget(null);
    if (shouldRefresh) {
      loadClients();
      setIsSuccessOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            Gestión de Clientes
          </h3>
          <p className="text-xs text-muted-foreground">
            Consulta y corrige los datos de los clientes registrados en taquilla
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* TABLA */}
      <ClientsTable
        clients={paginated}
        isLoading={loading}
        onEdit={setEditTarget}
      />

      {/* PAGINACIÓN */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl shadow-sm">
          <p className="text-sm text-gray-700">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
            {filtered.length} resultados
          </p>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-l-md disabled:opacity-50"
            >
              ◀
            </button>
            <div className="px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">
              Página {currentPage} de {totalPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50"
            >
              ▶
            </button>
          </nav>
        </div>
      )}

      {/* MODALES */}
      <EditCustomerModal
        open={!!editTarget}
        customer={editTarget}
        onClose={handleEditClose}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Cliente Actualizado"
        message="Los datos del cliente han sido modificados correctamente."
      />
    </div>
  );
}
