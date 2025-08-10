import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface ExitOrder {
  id: number;
  vehicle_id: number;
  driver_id: number;
  client_id: number;
  exit_date: string;
  entry_date: string;
  exit_time: string;
  entry_time: string;
  exit_reason: string;
  created_at: string;
  placa: string;
  driver_name: string;
  driver_lastname: string;
  client_name: string;
}

export default function ExitOrderTable() {
  const [orders, setOrders] = useState<ExitOrder[]>([]);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<ExitOrder | null>(null);
  const [selectedClient, setSelectedClient] = useState("Todos");
  const [selectedDriver, setSelectedDriver] = useState("Todos");
  const [selectedVehicle, setSelectedVehicle] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/exit-orders/exit-orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const clients = useMemo(() => {
    return [{ label: "Todos", value: "Todos" }, ...Array.from(new Set(orders.map((o) => o.client_name))).map(c => ({ label: c, value: c }))];
  }, [orders]);

  const drivers = useMemo(() => {
    return [{ label: "Todos", value: "Todos" }, ...Array.from(new Set(orders.map((o) => `${o.driver_name} ${o.driver_lastname}`))).map(d => ({ label: d, value: d }))];
  }, [orders]);

  const vehicles = useMemo(() => {
    return [{ label: "Todos", value: "Todos" }, ...Array.from(new Set(orders.map((o) => o.placa))).map(v => ({ label: v, value: v }))];
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const driverFullName = `${o.driver_name} ${o.driver_lastname}`;
      const matchSearch =
        o.exit_reason?.toLowerCase().includes(search.toLowerCase()) ||
        o.exit_date.includes(search) ||
        o.placa.toLowerCase().includes(search.toLowerCase()) ||
        driverFullName.toLowerCase().includes(search.toLowerCase()) ||
        o.client_name.toLowerCase().includes(search.toLowerCase());

      const matchClient = selectedClient === "Todos" || o.client_name === selectedClient;
      const matchDriver = selectedDriver === "Todos" || driverFullName === selectedDriver;
      const matchVehicle = selectedVehicle === "Todos" || o.placa === selectedVehicle;

      return matchSearch && matchClient && matchDriver && matchVehicle;
    });
  }, [orders, search, selectedClient, selectedDriver, selectedVehicle]);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta orden?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/exit-orders/exit-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o.id !== id));
      setDetalle(null);
    } catch (err) {
      console.error("Error al eliminar la orden:", err);
    }
  };

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por Referencia, fecha, camión, conductor o cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Select
          options={clients}
          onChange={setSelectedClient}
          placeholder="Cliente"
          className="w-40 text-sm"
        />
        <Select
          options={drivers}
          onChange={setSelectedDriver}
          placeholder="Conductor"
          className="w-40 text-sm"
        />
        <Select
          options={vehicles}
          onChange={setSelectedVehicle}
          placeholder="Vehículo"
          className="w-40 text-sm"
        />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/create-exit-order")}>
            Crear orden de salida
          </Button>
        </div>
      </div>

      {/* Tabla escritorio */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Vehículo", "Cliente", "Conductor", "Fecha salida", "Hora salida", "Fecha entrada", "Hora entrada", "Referencia"].map((h) => (
                <th key={h} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                onClick={() => setDetalle(o)}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{o.placa}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{o.client_name}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{o.driver_name} {o.driver_lastname}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatDate(o.exit_date)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatTime(o.exit_time)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatDate(o.entry_date)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatTime(o.entry_time)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{o.exit_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((o) => (
          <div
            key={o.id}
            onClick={() => setDetalle(o)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p><strong>Vehículo:</strong> {o.placa}</p>
            <p><strong>Cliente:</strong> {o.client_name}</p>
            <p><strong>Conductor:</strong> {o.driver_name} {o.driver_lastname}</p>
            <p><strong>Fecha salida:</strong> {formatDate(o.exit_date)}</p>
            <p><strong>Hora salida:</strong> {formatTime(o.exit_time)}</p>
            <p><strong>Fecha entrada:</strong> {formatDate(o.entry_date)}</p>
            <p><strong>Hora entrada:</strong> {formatTime(o.entry_time)}</p>
            <p><strong>Referencia:</strong> {o.exit_reason}</p>
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
              Detalle de la orden de salida
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-800 dark:text-gray-200">
              <div>
                <p><strong>Vehículo:</strong> {detalle.placa}</p>
                <p><strong>Cliente:</strong> {detalle.client_name}</p>
                <p><strong>Conductor:</strong> {detalle.driver_name} {detalle.driver_lastname}</p>
              </div>
              <div>
                <p><strong>Fecha salida:</strong> {formatDate(detalle.exit_date)}</p>
                <p><strong>Hora salida:</strong> {formatTime(detalle.exit_time)}</p>
                <p><strong>Fecha entrada:</strong> {formatDate(detalle.entry_date)}</p>
                <p><strong>Hora entrada:</strong> {formatTime(detalle.entry_time)}</p>
                <p><strong>Referencia:</strong> {detalle.exit_reason}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button variant="primary" onClick={() => navigate(`/exit-orders/edit/${detalle.id}`)}>
                Editar orden
              </Button>
              <Button variant="outline" onClick={() => handleDelete(detalle.id)}>
                Eliminar orden
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
