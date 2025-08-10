import { useEffect, useState } from "react";
import axios from "axios";
import Select from "../../components/form/Select";
import CreateObservationForm from "./CreateObservations/CreateObservations"; // Importa el formulario

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Observation {
  id: number;
  vehicle_license_plate: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  person_name: string;
  person_lastname: string;
  person_identification: string;
  created_at: string;
  updated_at: string;
}

export default function ObservationsTable() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [detalle, setDetalle] = useState<Observation | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [showForm, setShowForm] = useState(false); // Modal

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/observations/observations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const mesesUnicos = Array.from(
    new Set(observations.map((o) => new Date(o.created_at).getMonth() + 1))
  )
    .sort((a, b) => a - b)
    .map((m) => m.toString().padStart(2, "0"));

  const mesOptions = ["Todos", ...mesesUnicos].map((m) => ({ label: m, value: m }));

  const filteredObservations = observations.filter((o) => {
    const matchesSearch = o.vehicle_license_plate.toLowerCase().includes(search.toLowerCase());
    const mes = new Date(o.created_at).getMonth() + 1;
    const matchesMonth = selectedMonth === "Todos" || selectedMonth === mes.toString().padStart(2, "0");
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Visitas Registradas</h1>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por placa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[160px] px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10"
          />
          <Select options={mesOptions} onChange={setSelectedMonth} />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Crear Visita
          </button>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Placa", "Marca", "Modelo", "Año", "Color", "Nombre", "Cédula", "Fecha"].map((t, i) => (
                <th key={i} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredObservations.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
                onClick={() => setDetalle(o)}
              >
                <td className="px-5 py-3 text-sm">{o.vehicle_license_plate}</td>
                <td className="px-5 py-3 text-sm">{o.vehicle_brand}</td>
                <td className="px-5 py-3 text-sm">{o.vehicle_model}</td>
                <td className="px-5 py-3 text-sm">{o.vehicle_year}</td>
                <td className="px-5 py-3 text-sm">{o.vehicle_color}</td>
                <td className="px-5 py-3 text-sm">{`${o.person_name} ${o.person_lastname}`}</td>
                <td className="px-5 py-3 text-sm">{o.person_identification}</td>
                <td className="px-5 py-3 text-sm">{formatearFecha(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas Mobile */}
      <div className="block md:hidden p-4 space-y-4">
        {filteredObservations.map((o) => (
          <div
            key={o.id}
            onClick={() => setDetalle(o)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer"
          >
            <p><strong>Placa:</strong> {o.vehicle_license_plate}</p>
            <p><strong>Marca:</strong> {o.vehicle_brand}</p>
            <p><strong>Modelo:</strong> {o.vehicle_model}</p>
            <p><strong>Año:</strong> {o.vehicle_year}</p>
            <p><strong>Color:</strong> {o.vehicle_color}</p>
            <p><strong>Nombre:</strong> {o.person_name} {o.person_lastname}</p>
            <p><strong>Cédula:</strong> {o.person_identification}</p>
            <p><strong>Fecha:</strong> {formatearFecha(o.created_at)}</p>
          </div>
        ))}
      </div>

      {/* Modal Detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 px-4" onClick={() => setDetalle(null)}>
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={() => setDetalle(null)}>✕</button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Detalle de Visita</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Placa:</strong> {detalle.vehicle_license_plate}</p>
              <p><strong>Marca:</strong> {detalle.vehicle_brand}</p>
              <p><strong>Modelo:</strong> {detalle.vehicle_model}</p>
              <p><strong>Año:</strong> {detalle.vehicle_year}</p>
              <p><strong>Color:</strong> {detalle.vehicle_color}</p>
              <p><strong>Nombre:</strong> {detalle.person_name} {detalle.person_lastname}</p>
              <p><strong>Cédula:</strong> {detalle.person_identification}</p>
              <p><strong>Fecha:</strong> {formatearFecha(detalle.created_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Observación */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 px-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={() => setShowForm(false)}>✕</button>
            <CreateObservationForm onDone={() => { setShowForm(false); fetchData(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
