import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Lee el id del usuario desde localStorage.decodedToken
function getUserIdFromStorage(): number | null {
  try {
    const raw = localStorage.getItem("decodedToken");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.id === "number") return parsed.id;
      if (parsed.user && typeof parsed.user.id === "number") return parsed.user.id;
    }
    return null;
  } catch {
    return null;
  }
}

export default function CreateObservationForm({ onDone }: { onDone?: () => void }) {
  const [form, setForm] = useState({
    destination: "",
    person_fullname: "",
    identification_type: "",
    person_identification: "",
    vehicle_type: "",
    vehicle_license_plate: "",
    vehicle_brand: "",
    vehicle_color: "",
    observation_text: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Normalizaciones ligeras
    if (name === "vehicle_license_plate") {
      return setForm((f) => ({ ...f, [name]: value.toUpperCase().trim() }));
    }
    if (name === "person_fullname" || name === "vehicle_brand" || name === "vehicle_color") {
      return setForm((f) => ({ ...f, [name]: value.trimStart() })); // evita espacios iniciales
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const {
      destination,
      person_fullname,
      identification_type,
      person_identification,
      vehicle_type,
      vehicle_license_plate,
      vehicle_brand,
      vehicle_color,
    } = form;

    if (
      !destination ||
      !person_fullname ||
      !identification_type ||
      !person_identification ||
      !vehicle_type ||
      !vehicle_license_plate ||
      !vehicle_brand ||
      !vehicle_color
    ) {
      return "Todos los campos obligatorios deben ser completados.";
    }
    if (vehicle_license_plate.length < 5) return "La placa parece inválida.";
    if (person_identification.length < 5) return "La identificación parece inválida.";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const msg = validate();
    if (msg) {
      setErrorMessage(msg);
      return;
    }

    // Obtener user_id desde decodedToken
    const userId = getUserIdFromStorage();
    if (!userId) {
      setErrorMessage("No se pudo obtener el usuario (decodedToken inválido o ausente).");
      return;
    }

    setErrorMessage("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        user_id: userId, // 👉 lo enviamos en el body
        destination: form.destination.trim(),
        person_fullname: form.person_fullname.trim(),
        identification_type: form.identification_type.trim(),
        person_identification: form.person_identification.trim(),
        vehicle_type: form.vehicle_type.trim(),
        vehicle_license_plate: form.vehicle_license_plate.trim().toUpperCase(),
        vehicle_brand: form.vehicle_brand.trim(),
        vehicle_color: form.vehicle_color.trim(),
        observation_text: form.observation_text?.trim() || null,
      };

      await axios.post(`${apiUrl}/observations/observations/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Visita registrada correctamente");

      // Reset + cerrar
      setForm({
        destination: "",
        person_fullname: "",
        identification_type: "",
        person_identification: "",
        vehicle_type: "",
        vehicle_license_plate: "",
        vehicle_brand: "",
        vehicle_color: "",
        observation_text: "",
      });
      onDone?.();
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setErrorMessage("No autorizado. Inicia sesión nuevamente.");
      } else if (err?.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Error al registrar la visita");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md space-y-6 max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Visita</h2>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Destino:</label>
          <select
            name="destination"
            value={form.destination}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="HUZA KAPITAL">HUZA KAPITAL</option>
            <option value="CEDI">CEDI</option>
            <option value="GOVIL">GOVIL</option>
            <option value="TALLER">TALLER</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Nombre Completo:</label>
          <input
            type="text"
            name="person_fullname"
            value={form.person_fullname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo de Identificación:</label>
          <select
            name="identification_type"
            value={form.identification_type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="Cédula">Cédula</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Número de Identificación:</label>
          <input
            type="text"
            name="person_identification"
            value={form.person_identification}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo de Vehículo:</label>
          <select
            name="vehicle_type"
            value={form.vehicle_type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="Moto">Moto</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Panel">Panel</option>
            <option value="Camión">Camión</option>
            <option value="Mula">Mula</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Placa:</label>
          <input
            type="text"
            name="vehicle_license_plate"
            value={form.vehicle_license_plate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Marca:</label>
          <input
            type="text"
            name="vehicle_brand"
            value={form.vehicle_brand}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Color:</label>
          <input
            type="text"
            name="vehicle_color"
            value={form.vehicle_color}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Observaciones:</label>
          <textarea
            name="observation_text"
            value={form.observation_text}
            onChange={handleChange}
            rows={3}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            placeholder="Escriba cualquier observación relevante..."
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={submitting}
        className={`px-6 py-2 rounded text-white transition-colors mt-4 ${
          submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Guardando..." : "Guardar"}
      </motion.button>
    </motion.form>
  );
}
