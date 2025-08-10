import { useEffect, useState } from "react";
import axios from "axios";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Vehicle {
  id: number;
  placa: string;
  ruv: string;
  ubicacion: string;
  propietario: string;
  municipio: string;
  mes_de_placa: string;
  marca: string;
  precio: number;
  modelo: string;
  capacidad: number;
  vin: string;
  ton: number;
  year: number;
  uso: string;
  created_at: string;
}

interface Inspeccion {
  id: number;
  tipo: "entrada" | "salida";
  fecha: string;
  hora: string;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const formatFecha = (fecha: string) => {
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = (d.getMonth() + 1).toString().padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const formatHora = (hora: string) => hora.slice(0, 5); // HH:MM

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Vehicle | null>(null);
  const [inspeccionesVehiculo, setInspeccionesVehiculo] = useState<Inspeccion[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [selectedYear, setSelectedYear] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedOwner, setSelectedOwner] = useState("Todos");

  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/vehicles/vehicles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInspeccionesVehiculo = async (vehicleId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/vehicle-inspections/by-vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspeccionesVehiculo(res.data);
    } catch (err) {
      console.error("Error al obtener inspecciones del vehículo:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.placa.toLowerCase().includes(search.toLowerCase());
    const matchBrand = selectedBrand === "Todos" || v.marca === selectedBrand;
    const matchYear = selectedYear === "Todos" || String(v.year) === selectedYear;
    const matchMonth = selectedMonth === "Todos" || v.mes_de_placa === selectedMonth;
    const matchOwner = selectedOwner === "Todos" || v.propietario === selectedOwner;
    return matchSearch && matchBrand && matchYear && matchMonth && matchOwner;
  });

  const toOptions = (arr: string[]) => arr.map((val) => ({ label: val, value: val }));
  const brands = toOptions(["Todos", ...new Set(vehicles.map((v) => v.marca))]);
  const years = toOptions(["Todos", ...new Set(vehicles.map((v) => String(v.year)))]);
  const months = toOptions(["Todos", ...new Set(vehicles.map((v) => v.mes_de_placa))]);
  const owners = toOptions(["Todos", ...new Set(vehicles.map((v) => v.propietario))]);

  const handleDownloadRuv = (path: string) => {
    const url = `${apiUrl}/uploads/${path}`;
    window.open(url, "_blank");
  };

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por placa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Select options={brands} onChange={setSelectedBrand} placeholder="Selecciona marca" className="w-32 text-sm" />
        <Select options={years} onChange={setSelectedYear} placeholder="Selecciona año" className="w-24 text-sm" />
        <Select options={months} onChange={setSelectedMonth} placeholder="Selecciona mes" className="w-28 text-sm" />
        <Select options={owners} onChange={setSelectedOwner} placeholder="Selecciona propietario" className="w-36 text-sm" />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/create-vehicle")}>
            Crear vehículo
          </Button>
        </div>
      </div>

      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {["Placa", "Propietario", "Marca", "Modelo", "VIN", "Año", "Uso", "Precio"].map((h) => (
                <th key={h} className="px-5 py-3 text-sm text-start text-gray-600 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr
                key={v.id}
                onClick={() => {
                  setDetalle(v);
                  fetchInspeccionesVehiculo(v.id);
                }}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.placa}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.propietario}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.marca}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.modelo}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.vin}</td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{v.year}</td>
                <td className="px-5 py-3 text-sm"><Badge size="sm" color="warning">{v.uso}</Badge></td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{formatPrice(v.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            onClick={() => {
              setDetalle(v);
              fetchInspeccionesVehiculo(v.id);
            }}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p><strong>Placa:</strong> {v.placa}</p>
            <p><strong>Marca:</strong> {v.marca}</p>
            <p><strong>Modelo:</strong> {v.modelo}</p>
            <p><strong>Año:</strong> {v.year}</p>
            <p><strong>Uso:</strong> {v.uso}</p>
          </div>
        ))}
      </div>

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
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Detalle del Vehículo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
              <p><strong>Placa:</strong> {detalle.placa}</p>
              <p><strong>Propietario:</strong> {detalle.propietario}</p>
              <p><strong>Marca:</strong> {detalle.marca}</p>
              <p><strong>Modelo:</strong> {detalle.modelo}</p>
              <p><strong>VIN:</strong> {detalle.vin}</p>
              <p><strong>Capacidad:</strong> {detalle.capacidad}</p>
              <p><strong>Toneladas:</strong> {detalle.ton}</p>
              <p><strong>Año:</strong> {detalle.year}</p>
              <p><strong>Uso:</strong> {detalle.uso}</p>
              <p><strong>Precio:</strong> {formatPrice(detalle.precio)}</p>
              <p><strong>Ubicación:</strong> {detalle.ubicacion}</p>
              <p><strong>Municipio:</strong> {detalle.municipio}</p>
              <p><strong>Mes de placa:</strong> {detalle.mes_de_placa}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Entradas / Salidas</h3>
              {inspeccionesVehiculo.length > 0 ? (
                <ul className="space-y-1">
  {inspeccionesVehiculo.map((i) => (
    <li
      key={i.id}
      className="text-sm flex justify-between items-center text-gray-800 dark:text-gray-200"
    >
      <div>
        <Badge size="sm" color={i.tipo === "entrada" ? "success" : "info"}>
          {i.tipo}
        </Badge>{" "}
        <span className="text-gray-700 dark:text-gray-300">
          {formatFecha(i.fecha)} {formatHora(i.hora)}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 dark:text-blue-400 hover:underline"
        onClick={() => navigate(`/vehicle-inspection`)}
      >
        Ver detalle
      </Button>
    </li>
  ))}
</ul>

              ) : (
                <p className="text-sm text-gray-500">Sin entradas o salidas registradas.</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {detalle.ruv && (
                <Button variant="outline" onClick={() => handleDownloadRuv(detalle.ruv)}>
                  Descargar RUV
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate(`/vehicles/edit/${detalle.id}`)}>
                Editar vehículo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
