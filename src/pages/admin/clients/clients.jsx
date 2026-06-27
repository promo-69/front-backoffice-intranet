import { useEffect, useState, useCallback } from "react";
import { getCustomers } from "@/services/customers.service";
import ClientsTable from "./clientsTab";
import { Search } from "lucide-react"; 

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* CABECERA CON INPUT DE BÚSQUEDA INTEGRADO */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Listado de Clientes
          </h3>
          <p className="text-xs text-muted-foreground">
            Gestión y fidelización de la comunidad de Cineflix.
          </p>
        </div>

        {/* BUSCADOR DIRECTO EN CABECERA */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all pl-10"
          />
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <ClientsTable
        clients={filteredClients}
        isLoading={loading}
        onRefresh={loadClients}
      />
      
    </div>
  );
}
