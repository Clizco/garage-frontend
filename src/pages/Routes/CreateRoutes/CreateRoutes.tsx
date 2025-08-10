import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Vehicle {
  id: number;
  placa: string;
  marca?: string;
  modelo?: string;
}

interface CommonUser {
  id: number;
  user_firstname: string;
  user_lastname: string;
}

export default function CreateRoute({
  onDone,
  onStart,
}: {
  onDone?: () => void;
  onStart?: (data: {
    id: number;
    vehicle_id: number;
    placa: string;
    route_name: string;
    driver_name: string;
    driver_lastname: string;
    startTime: Date;
  }) => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchPlaca, setSearchPlaca] = useState("");
  const [filteredPlacas, setFilteredPlacas] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDropdownVehicle, setShowDropdownVehicle] = useState(false);
  const [routeName, setRouteName] = useState("");

  const routeOptions = [
    "OPEN BLUE - COLON",
    "MACHETAZO CORONADO",
    "MACHETAZO - BRISAS DEL GOLF",
    "MACHETAZO - COSTA SUR",
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${apiUrl}/vehicles/vehicles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data);
      } catch (err) {
        console.error("Error al cargar vehículos:", err);
      }
    };
    fetchVehicles();
  }, []);

  const comenzarRuta = async () => {
    if (!vehicleId || !selectedVehicle || !routeName) {
      alert("Debes seleccionar placa y ruta");
      return;
    }

    const user = JSON.parse(localStorage.getItem("decodedToken") || "{}") as CommonUser;
    if (!user?.id) {
      alert("Usuario no autenticado");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${apiUrl}/routes/routes/create`, {
        vehicle_id: vehicleId,
        user_id: user.id,
        route_name: routeName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const startTime = new Date();

      if (onStart) {
        onStart({
          id: res.data.id,
          vehicle_id: vehicleId,
          placa: selectedVehicle.placa,
          route_name: routeName,
          driver_name: user.user_firstname,
          driver_lastname: user.user_lastname,
          startTime,
        });
      }
    } catch (err) {
      console.error("Error al crear la ruta:", err);
      alert("Error al crear la ruta");
    }
  };

  const handleClose = () => {
    if (onDone) onDone();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 bg-white dark:bg-gray-900 rounded-md shadow-md space-y-4 max-w-3xl mx-auto relative"
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold text-gray-800 dark:text-white">Registrar Ruta</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-sm text-gray-600 dark:text-gray-300">Placa:</label>
          <input
            type="text"
            placeholder="Buscar placa..."
            value={searchPlaca}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSearchPlaca(val);
              setFilteredPlacas(vehicles.filter(v => v.placa.toUpperCase().includes(val)));
              setShowDropdownVehicle(true);
            }}
            onFocus={() => setShowDropdownVehicle(true)}
            onBlur={() => setTimeout(() => setShowDropdownVehicle(false), 150)}
            className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
          />
          <AnimatePresence>
            {showDropdownVehicle && filteredPlacas.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-10 bg-white dark:bg-gray-800 w-full border rounded mt-1 max-h-40 overflow-y-auto"
              >
                {filteredPlacas.map(v => (
                  <li
                    key={v.id}
                    onMouseDown={() => {
                      setVehicleId(v.id);
                      setSearchPlaca(v.placa);
                      setSelectedVehicle(v);
                      setShowDropdownVehicle(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-600 dark:text-white text-sm"
                  >
                    {v.placa}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="text-sm text-gray-600 dark:text-gray-300">Marca y modelo:</label>
            <input
              type="text"
              value={`${selectedVehicle.marca || ""} ${selectedVehicle.modelo || ""}`}
              disabled
              className="w-full border px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed"
            />
          </motion.div>
        )}

        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Ruta:</label>
          <select
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="">Seleccionar ruta</option>
            {routeOptions.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={comenzarRuta}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Comenzar Ruta
        </motion.button>
      </div>
    </motion.form>
  );
}
