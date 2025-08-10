import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Client {
  id: number;
  client_name: string;
  client_ruc: string;
  client_type: string;
  created_at: string;
}

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Client | null>(null);
  const [selectedType, setSelectedType] = useState("Todos");

  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/clients/clients/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.client_ruc.toLowerCase().includes(search.toLowerCase());

    const matchType =
      selectedType === "Todos" || c.client_type === selectedType;

    return matchSearch && matchType;
  });

  const toOptions = (arr: string[]) =>
    arr.map((val) => ({ label: val, value: val }));

  const clientTypes = toOptions([
    "Todos",
    ...Array.from(new Set(clients.map((c) => c.client_type))),
  ]);

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o RUC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-40 px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10"
        >
          {clientTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/create-client")}>
            Crear cliente
          </Button>
        </div>
      </div>

      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Nombre", "RUC", "Tipo" ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setDetalle(c)}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {c.client_name}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {c.client_ruc}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {c.client_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setDetalle(c)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p>
              <strong>Nombre:</strong> {c.client_name}
            </p>
            <p>
              <strong>RUC:</strong> {c.client_ruc}
            </p>
            <p>
              <strong>Tipo:</strong> {c.client_type}
            </p>
          </div>
        ))}
      </div>

      {detalle && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 px-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setDetalle(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Detalle del Cliente
            </h2>
            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Nombre:</strong> {detalle.client_name}</p>
              <p><strong>RUC:</strong> {detalle.client_ruc}</p>
              <p><strong>Tipo:</strong> {detalle.client_type}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(`/clients/edit/${detalle.id}`)}
              >
                Editar cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
