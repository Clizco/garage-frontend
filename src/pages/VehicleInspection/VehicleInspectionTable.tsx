import { useEffect, useState } from "react";
import axios from "axios";
import CreateVehicleInspectionForm from "./CreateVehicleInspection/CreateVehicleInspection";
import Select from "../../components/form/Select";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Inspeccion {
  id: number;
  tipo: "entrada" | "salida";
  fecha: string;
  hora: string;
  kilometraje: number;
  nivel_combustible: string;
  observaciones: string;
  vehicle_id: number;
  placa: string;
  accesorios?: any;
  luces_sistemas?: any;
}

interface Vehicle {
  id: number;
  placa: string;
}

export default function InspeccionVehicularView() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tipoForm, setTipoForm] = useState<"entrada" | "salida">("entrada");
  const [detalle, setDetalle] = useState<Inspeccion | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [inspeccionesRes, vehiclesRes] = await Promise.all([
        axios.get(`${apiUrl}/vehicle-inspections/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/vehicles/vehicles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const vehiclesMap: Record<number, string> = {};
      vehiclesRes.data.forEach((v: Vehicle) => (vehiclesMap[v.id] = v.placa));

      const inspeccionesConPlaca = inspeccionesRes.data.map((i: any) => ({
        ...i,
        placa: vehiclesMap[i.vehicle_id] || "SIN PLACA",
        accesorios:
          typeof i.accesorios === "string" ? JSON.parse(i.accesorios) : i.accesorios,
        luces_sistemas:
          typeof i.luces_sistemas === "string" ? JSON.parse(i.luces_sistemas) : i.luces_sistemas,
      }));

      setInspecciones(inspeccionesConPlaca);
      setVehicles(vehiclesRes.data);
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

  const formatearHora = (hora: string) => hora.slice(0, 5);

  const filteredInspecciones = inspecciones.filter((i) => {
    const matchesSearch = i.placa.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = selectedTipo === "Todos" || i.tipo === selectedTipo;
    const mes = new Date(i.fecha).getMonth() + 1;
    const mesTexto = mes.toString().padStart(2, "0");
    const matchesMonth = selectedMonth === "Todos" || selectedMonth === mesTexto;
    return matchesSearch && matchesTipo && matchesMonth;
  });

  const mesesUnicos = Array.from(
    new Set(inspecciones.map((i) => new Date(i.fecha).getMonth() + 1))
  )
    .sort((a, b) => a - b)
    .map((num) => num.toString().padStart(2, "0"));

  const tipoOptions = ["Todos", "entrada", "salida"].map((t) => ({ label: t, value: t }));
  const mesOptions = ["Todos", ...mesesUnicos].map((m) => ({ label: m, value: m }));

  async function handleDelete(id: number): Promise<void> {
    if (!window.confirm("¿Está seguro de eliminar este reporte de inspección?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/vehicle-inspections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetalle(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el reporte. Intente nuevamente.");
    }
  }

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Historial de Entradas y Salidas
        </h1>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por placa"
            className="min-w-[160px] px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select options={tipoOptions} onChange={setSelectedTipo} />
          <Select options={mesOptions} onChange={setSelectedMonth} />
          <button
            onClick={() => {
              setTipoForm("entrada");
              setShowForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Crear Entrada
          </button>
          <button
            onClick={() => {
              setTipoForm("salida");
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Crear Salida
          </button>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Placa", "Tipo", "Fecha", "Hora", "Km", "Combustible", "Observaciones"].map(
                (t, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300"
                  >
                    {t}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredInspecciones.map((i) => (
              <tr
                key={i.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
                onClick={() => setDetalle(i)}
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{i.placa}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200 capitalize">{i.tipo}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatearFecha(i.fecha)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatearHora(i.hora)}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{i.kilometraje ?? "-"}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{i.nivel_combustible}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{i.observaciones ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas mobile */}
      <div className="block md:hidden p-4 space-y-4">
        {filteredInspecciones.map((i) => (
          <div
            key={i.id}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer"
            onClick={() => setDetalle(i)}
          >
            <p className="text-gray-700 dark:text-gray-200"><strong>Placa:</strong> {i.placa}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Tipo:</strong> {i.tipo}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Fecha:</strong> {formatearFecha(i.fecha)}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Hora:</strong> {formatearHora(i.hora)}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Km:</strong> {i.kilometraje ?? "-"}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Combustible:</strong> {i.nivel_combustible}</p>
            <p className="text-gray-700 dark:text-gray-200"><strong>Observaciones:</strong> {i.observaciones ?? "-"}</p>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 px-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
            <CreateVehicleInspectionForm
              tipoPorDefecto={tipoForm}
              placasDisponibles={vehicles}
              onDone={() => {
                setShowForm(false);
                fetchData();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 px-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setDetalle(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Detalle de Inspección
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Placa:</strong> {detalle.placa}</p>
              <p><strong>Tipo:</strong> {detalle.tipo}</p>
              <p><strong>Fecha:</strong> {formatearFecha(detalle.fecha)}</p>
              <p><strong>Hora:</strong> {formatearHora(detalle.hora)}</p>
              <p><strong>Kilometraje:</strong> {detalle.kilometraje ?? "-"}</p>
              <p><strong>Combustible:</strong> {detalle.nivel_combustible}</p>
              <p className="sm:col-span-2"><strong>Observaciones:</strong> {detalle.observaciones || "-"}</p>
            </div>
            <button
              className="mt-6 px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition"
              onClick={() => handleDelete(detalle.id)}
            >
              Eliminar reporte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
