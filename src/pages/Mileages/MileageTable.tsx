import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Milage {
  id: number;
  vehicle_id: number;
  mileage: number;
  date: string;
  created_at: string;
  placa: string;
  marca: string;
  modelo: string;
}

export default function MilageTable() {
  const [records, setRecords] = useState<Milage[]>([]);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Milage | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/milages/milages/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecords();
  }, []);

  const vehicles = useMemo(() => {
    return [
      { label: "Todos", value: "Todos" },
      ...Array.from(new Set(records.map((r) => r.placa))).map((v) => ({
        label: v,
        value: v,
      })),
    ];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.placa.toLowerCase().includes(search.toLowerCase()) ||
        r.marca.toLowerCase().includes(search.toLowerCase()) ||
        r.modelo.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search) ||
        r.mileage.toString().includes(search);

      const matchVehicle = selectedVehicle === "Todos" || r.placa === selectedVehicle;

      return matchSearch && matchVehicle;
    });
  }, [records, search, selectedVehicle]);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/milages/milages/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(records.filter((r) => r.id !== id));
      setDetalle(null);
    } catch (err) {
      console.error("Error al eliminar el registro:", err);
    }
  };

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por placa, marca, modelo, fecha o kilometraje"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Select
          options={vehicles}
          onChange={setSelectedVehicle}
          placeholder="Vehículo"
          className="w-40 text-sm"
        />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/create-milage")}>
            Crear registro
          </Button>
        </div>
      </div>

      {/* Tabla escritorio */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Placa", "Marca", "Modelo", "Kilometraje", "Fecha"].map((h) => (
                <th key={h} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => setDetalle(r)}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{r.placa}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{r.marca}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{r.modelo}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{r.mileage.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatDate(r.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => setDetalle(r)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p><strong>Placa:</strong> {r.placa}</p>
            <p><strong>Marca:</strong> {r.marca}</p>
            <p><strong>Modelo:</strong> {r.modelo}</p>
            <p><strong>Kilometraje:</strong> {r.mileage.toLocaleString()}</p>
            <p><strong>Fecha:</strong> {formatDate(r.date)}</p>
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
              Detalle de registro de kilometraje
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-800 dark:text-gray-200">
              <div>
                <p><strong>Placa:</strong> {detalle.placa}</p>
                <p><strong>Marca:</strong> {detalle.marca}</p>
                <p><strong>Modelo:</strong> {detalle.modelo}</p>
              </div>
              <div>
                <p><strong>Kilometraje:</strong> {detalle.mileage.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {formatDate(detalle.date)}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button variant="primary" onClick={() => navigate(`/milages/edit/${detalle.id}`)}>
                Editar registro
              </Button>
              <Button variant="outline" onClick={() => handleDelete(detalle.id)}>
                Eliminar registro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
