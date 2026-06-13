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
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = clients.filter((c) => {
    const fullName =
      `${c.person.first_name} ${c.person.last_name}`.toLowerCase();
    const doc = c.person.document_number.toString().toLowerCase();
    const searchLower = search.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      doc.includes(searchLower)
    );
  });

  return <ClientsTable clients={filtered} isLoading={loading} />;
}