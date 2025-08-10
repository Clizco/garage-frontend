import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Vehicle {
  id: number;
  placa: string;
}

interface CreateVehicleInspectionFormProps {
  tipoPorDefecto?: "entrada" | "salida";
  onDone?: () => void;
  placasDisponibles: Vehicle[];
}

export default function VehicleInspectionForm({
  tipoPorDefecto = "entrada",
  onDone
}: CreateVehicleInspectionFormProps) {
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredPlates, setFilteredPlates] = useState<Vehicle[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [kilometrajeRaw, setKilometrajeRaw] = useState(""); // solo dígitos
  const [nivelCombustible, setNivelCombustible] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [accesorios, setAccesorios] = useState<Record<string, boolean>>({});
  const [luces, setLuces] = useState<Record<string, boolean>>({});

  const tipo = tipoPorDefecto; // Eliminamos el selector, usamos el valor por defecto

  const camposAccesorios = [
    "gato", "extintor", "llave_cruz", "herramientas", "radio", "bateria", "alfombras", "copas",
    "documentos", "conos_seg", "retrovisor", "forros", "triangulos", "botones",
    "limpieza_ext", "limpieza_int", "llantas_rep"
  ];

  const camposLuces = [
    "luces_tablero", "luces_piloto", "luces_retro", "luces_direccionales",
    "luces_intermitentes", "luces_frontales", "luces_techo", "sistema_ac", "sistema_refrigeracion"
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/vehicles/vehicles/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(response.data);
      } catch (err) {
        console.error("Error al cargar placas:", err);
      }
    };
    fetchVehicles();
  }, []);

  const toggle = (obj: any, key: string, setter: any) => {
    setter({ ...obj, [key]: !obj[key] });
  };

  const formatKilometraje = (value: string) => {
    if (!value) return "";
    const intVal = value.slice(0, -2) || "0";
    const decimalVal = value.slice(-2).padStart(2, '0');
    const intFormatted = parseInt(intVal, 10).toLocaleString();
    return `${intFormatted}.${decimalVal}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!vehicleId) return alert("Debes seleccionar una placa");
  try {
    await axios.post(`${apiUrl}/vehicle-inspections`, {
      vehicle_id: vehicleId,
      tipo,
      kilometraje: parseFloat(kilometrajeRaw) / 100, // Aquí lo envías bien
      nivel_combustible: nivelCombustible,
      accesorios,
      luces_sistemas: luces,
      observaciones
    });
    alert("Inspección registrada correctamente");
    if (onDone) onDone();
  } catch (error) {
    console.error(error);
    alert("Error al registrar inspección");
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white dark:bg-gray-900 rounded-md shadow-md space-y-4 max-w-4xl mx-auto"
    >
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">
        Registrar Inspección Vehicular
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buscador de Placa */}
        <div className="relative">
          <label className="text-sm text-gray-600 dark:text-gray-300">Placa:</label>
          <input
            type="text"
            className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Buscar placa..."
            value={
              vehicleId
                ? vehicles.find((v) => v.id === vehicleId)?.placa || searchText
                : searchText
            }
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSearchText(val);
              const matches = vehicles.filter((v) =>
                v.placa.toUpperCase().includes(val)
              );
              setFilteredPlates(matches);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {showDropdown && filteredPlates.length > 0 && (
            <ul className="absolute z-10 bg-white dark:bg-gray-800 w-full border border-gray-300 dark:border-white/10 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
              {filteredPlates.map((v) => (
                <li
                  key={v.id}
                  onMouseDown={() => {
                    setVehicleId(v.id);
                    setSearchText(v.placa);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer text-sm text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600"
                >
                  {v.placa}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kilometraje */}
       <div>
  <label className="text-sm text-gray-600 dark:text-gray-300">
    {tipo === "entrada" ? "Kilometraje de entrada:" : "Kilometraje de salida:"}
  </label>
  <input
  type="text"
  value={formatKilometraje(kilometrajeRaw)}
  onChange={(e) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 10);
    setKilometrajeRaw(raw);
  }}
  placeholder="Ej: 999,999.99"
  inputMode="numeric"
  className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
/>

</div>


        {/* Combustible */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Nivel de combustible:</label>
          <select
            value={nivelCombustible}
            onChange={(e) => setNivelCombustible(e.target.value)}
            className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Seleccionar</option>
            <option value="1/4">1/4</option>
            <option value="1/2">1/2</option>
            <option value="3/4">3/4</option>
            <option value="F">Full</option>
          </select>
        </div>
      </div>

      {/* Accesorios */}
      <fieldset className="border p-3 rounded dark:border-white/10">
        <legend className="text-md font-semibold text-gray-700 dark:text-white">Accesorios</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {camposAccesorios.map((acc) => (
            <label key={acc} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
              <input
                type="checkbox"
                checked={accesorios[acc] || false}
                onChange={() => toggle(accesorios, acc, setAccesorios)}
              />
              {acc.replace(/_/g, " ").toUpperCase()}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Luces */}
      <fieldset className="border p-3 rounded dark:border-white/10">
        <legend className="text-md font-semibold text-gray-700 dark:text-white">Luces y sistemas</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {camposLuces.map((luz) => (
            <label key={luz} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
              <input
                type="checkbox"
                checked={luces[luz] || false}
                onChange={() => toggle(luces, luz, setLuces)}
              />
              {luz.replace(/_/g, " ").toUpperCase()}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Observaciones */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">Observaciones:</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto"
      >
        Guardar inspección
      </button>
    </form>
  );
}
