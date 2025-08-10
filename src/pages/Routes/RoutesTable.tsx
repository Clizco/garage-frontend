import { useEffect, useState } from "react";
import axios from "axios";
import RouteForm from "./CreateRoutes/CreateRoutes";

const apiUrl = import.meta.env.VITE_API_URL || "";
const RUTA_PROCESO_KEY = "ruta_en_proceso";

interface Ruta {
  id: number;
  vehicle_id: number;
  user_id: number;
  route_name: string;
  travel_time: string;
  created_at: string;
  updated_at: string;
  end_at: string | null;
  placa: string;
  driver_name: string;
  driver_lastname: string;
}

export default function RoutesTable() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [detalle, setDetalle] = useState<Ruta | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [rutaEnProceso, setRutaEnProceso] = useState<{
    id: number;
    vehicle_id: number;
    placa: string;
    route_name: string;
    driver_name: string;
    driver_lastname: string;
    startTime: Date;
    endTime?: Date;
  } | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [, setHoraFinal] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/routes/routes/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem(RUTA_PROCESO_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.startTime) {
          parsed.startTime = new Date(parsed.startTime);
          setRutaEnProceso(parsed);
        }
      } catch (err) {
        console.error("Error al parsear ruta en proceso:", err);
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rutaEnProceso) {
      const updateElapsed = () => {
        const now = new Date().getTime();
        const start = new Date(rutaEnProceso.startTime).getTime();
        setElapsed(now - start);
      };
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [rutaEnProceso]);

  const finalizarRuta = async () => {
    if (!rutaEnProceso) return;

    const endTime = new Date();
    const diff = endTime.getTime() - new Date(rutaEnProceso.startTime).getTime();

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const travel_time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    try {
      const token = localStorage.getItem("token");

      // ✅ Usamos PUT para actualizar ruta existente
      await axios.put(`${apiUrl}/routes/routes/update/${rutaEnProceso.id}`, {
        travel_time,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Ruta finalizada correctamente");
      setHoraFinal(endTime);
      setRutaEnProceso(null);
      localStorage.removeItem(RUTA_PROCESO_KEY);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al finalizar ruta");
    }
  };

  const formatearHoraSimple = (fecha: Date) =>
    fecha.toLocaleTimeString("es-PA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Panama",
    });

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Panama",
    });
  };

  const formatearHora = (fecha?: string | null) => {
    if (!fecha) return "Sin hora";
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return "Hora inválida";
    return dateObj.toLocaleTimeString("es-PA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Panama",
    });
  };

  const formatearTiempo = (tiempo: string | null | undefined) => {
    if (!tiempo) return "Sin registrar";
    const [h, m, s] = tiempo.split(":").map(Number);
    const parts = [];
    if (h) parts.push(`${h} ${h === 1 ? "hora" : "horas"}`);
    if (m) parts.push(`${m} ${m === 1 ? "minuto" : "minutos"}`);
    if (!h && !m) parts.push(`${s} ${s === 1 ? "segundo" : "segundos"}`);
    return parts.join(" ");
  };

  const formatearMs = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const filteredRutas = rutas.filter((r) =>
    r.placa.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Historial de Rutas</h1>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por placa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[160px] px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Crear Ruta
          </button>
        </div>
      </div>

      {rutaEnProceso && (
        <div className="p-4">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-xl p-4 text-gray-800 dark:text-white">
            <p><strong>Ruta en Proceso:</strong> {rutaEnProceso.route_name}</p>
            <p><strong>Placa:</strong> {rutaEnProceso.placa}</p>
            <p><strong>Conductor:</strong> {rutaEnProceso.driver_name} {rutaEnProceso.driver_lastname}</p>
            <p><strong>Hora de inicio:</strong> {formatearHoraSimple(rutaEnProceso.startTime)}</p>
            <p><strong>Tiempo transcurrido:</strong> {formatearMs(elapsed)}</p>
            <button
              onClick={finalizarRuta}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Finalizar Ruta
            </button>
          </div>
        </div>
      )}

      {/* Tabla Desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Placa", "Conductor", "Ruta", "Tiempo", "Fecha", "Hora Final"].map((t, i) => (
                <th key={i} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRutas.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer" onClick={() => setDetalle(r)}>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{r.placa}</td>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{r.driver_name} {r.driver_lastname}</td>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{r.route_name}</td>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{formatearTiempo(r.travel_time)}</td>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{formatearFecha(r.created_at)}</td>
                <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">{formatearHora(r.end_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas Mobile */}
      <div className="block md:hidden p-4 space-y-4">
        {filteredRutas.map((r) => (
          <div key={r.id} onClick={() => setDetalle(r)} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200">
            <p><strong>Fecha:</strong> {formatearFecha(r.created_at)}</p>
            <p><strong>Ruta:</strong> {r.route_name}</p>
            <p><strong>Placa:</strong> {r.placa}</p>
            <p><strong>Conductor:</strong> {r.driver_name} {r.driver_lastname}</p>
            <p><strong>Hora de inicio:</strong> {formatearHora(r.created_at)}</p>
            <p><strong>Hora de finalización:</strong> {formatearHora(r.end_at || r.updated_at)}</p>
            <p><strong>Duración:</strong> {formatearTiempo(r.travel_time)}</p>
          </div>
        ))}
      </div>

      {/* Modal Crear Ruta */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 px-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-3xl relative" onClick={(e) => e.stopPropagation()}>
            <RouteForm
              onDone={() => { setShowForm(false); fetchData(); }}
              onStart={(data) => {
                setRutaEnProceso(data);
                localStorage.setItem(RUTA_PROCESO_KEY, JSON.stringify(data));
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20 px-4" onClick={() => setDetalle(null)}>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={() => setDetalle(null)}>✕</button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Detalle de Ruta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Placa:</strong> {detalle.placa}</p>
              <p><strong>Ruta:</strong> {detalle.route_name}</p>
              <p><strong>Conductor:</strong> {detalle.driver_name} {detalle.driver_lastname}</p>
              <p><strong>Tiempo:</strong> {formatearTiempo(detalle.travel_time)}</p>
              <p><strong>Fecha:</strong> {formatearFecha(detalle.created_at)}</p>
              <p><strong>Hora de inicio:</strong> {formatearHora(detalle.created_at)}</p>
              <p><strong>Hora de finalización:</strong> {formatearHora(detalle.end_at || detalle.updated_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
