import { useEffect, useState, useCallback } from "react";
import { getCustomers } from "@/services/customers.service";
import ClientsTable from "./clientsTab";
import { Search } from "lucide-react"; 

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      const clientData = response?.data || response || [];
      setClients(clientData);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 1. Primero filtramos el universo completo de clientes
  const filteredClients = clients.filter((c) => {
    if (!c?.person) return false;

    const firstName = c.person.first_name || "";
    const lastName = c.person.last_name || "";
    const documentNumber = c.person.document_number
      ? c.person.document_number.toString()
      : "";

    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const doc = documentNumber.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return fullName.includes(searchLower) || doc.includes(searchLower);
  });

  // 2. Calculamos los totales basados en el resultado filtrado
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // 3. Segmentamos la lista para mostrar solo los de la página activa
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientsPage = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Listado de Clientes
          </h3>
          <p className="text-xs text-muted-foreground">
            Gestión y fidelización de la comunidad de Cineflix.
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-72 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all pl-10"
          />
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <ClientsTable
        clients={currentClientsPage}
        isLoading={loading}
        onRefresh={loadClients}
      />

      {/* PAGINACIÓN */}
      {!loading && filteredClients.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-semibold">{indexOfFirstItem + 1}</span> a{" "}
              <span className="font-semibold">
                {Math.min(indexOfLastItem, filteredClients.length)}
              </span>{" "}
              de <span className="font-semibold">{filteredClients.length}</span>{" "}
              resultados
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50"
              >
                ▶
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
