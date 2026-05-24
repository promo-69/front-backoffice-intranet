import { useEffect, useState } from "react";
import { getCustomers } from "@/services/customers.service";
import ClientsTable from "./clientsTab";

export default function Clients({ search }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setClients(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ⭐ FILTRO POR NOMBRE O DOCUMENTO
  const filtered = clients.filter((c) => {
    const fullName =
      `${c.person.first_name} ${c.person.last_name}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      c.person.document_number.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading)
    return <p className="text-sm text-gray-500">Cargando clientes...</p>;

  return <ClientsTable clients={filtered} />;
}
