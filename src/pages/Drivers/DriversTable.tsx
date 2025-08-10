import { useEffect, useState } from "react";
import axios from "axios";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface Driver {
  id: number;
  driver_name: string;
  driver_lastname: string;
  driver_identification: string;
  driver_email: string;
  driver_phone: string;
  driver_license_type: string;
  driver_nationality: string;
  driver_birthdate: string;
  driver_license_issue_date: string;
  driver_license_expiration_date: string;
  driver_control_number: string;
  driver_license_file?: string;
  driver_identification_file?: string;
  created_at: string;
}

export default function DriverTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Driver | null>(null);
  const [selectedNationality, setSelectedNationality] = useState("Todos");
  const [selectedLicenseType, setSelectedLicenseType] = useState("Todos");

  const navigate = useNavigate();

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/drivers/drivers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = drivers.filter((d) => {
    const matchSearch =
      d.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      d.driver_lastname.toLowerCase().includes(search.toLowerCase()) ||
      d.driver_identification.toLowerCase().includes(search.toLowerCase());

    const matchNationality =
      selectedNationality === "Todos" || d.driver_nationality === selectedNationality;

    const matchLicense =
      selectedLicenseType === "Todos" ||
      d.driver_license_type
        .split(",")
        .map((t) => t.trim())
        .includes(selectedLicenseType);

    return matchSearch && matchNationality && matchLicense;
  });

  const toOptions = (arr: string[]) =>
    arr.map((val) => ({ label: val, value: val }));

  const nationalities = toOptions([
    "Todos",
    ...Array.from(new Set(drivers.map((d) => d.driver_nationality))),
  ]);

  const licenseTypes = toOptions([
    "Todos",
    ...Array.from(
      new Set(
        drivers.flatMap((d) =>
          d.driver_license_type
            .split(",")
            .map((t) => t.trim())
        )
      )
    ),
  ]);

  const handleDownloadFile = (path: string | undefined) => {
    if (!path) return;
    const url = `${apiUrl}/${path}`;
    window.open(url, "_blank");
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  async function handleDelete(id: number): Promise<void> {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este conductor?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/drivers/drivers/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      setDetalle(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el conductor.");
    }
  }

  return (
    <div className="overflow-hidden w-full max-w-screen-xl mx-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o identificación"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-white/10 text-sm text-gray-800 dark:text-white dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Select
          options={nationalities}
          onChange={setSelectedNationality}
          placeholder="Nacionalidad"
          className="w-40 text-sm"
        />
        <Select
          options={licenseTypes}
          onChange={setSelectedLicenseType}
          placeholder="Tipo de licencia"
          className="w-32 text-sm"
        />
        <div className="ml-auto">
          <Button variant="primary" onClick={() => navigate("/create-driver")}>
            Crear conductor
          </Button>
        </div>
      </div>

      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
          <thead className="bg-gray-100 dark:bg-white/[0.02]">
            <tr>
              {[
                "Nombre",
                "Apellido",
                "Identificación",
                "Correo",
                "Teléfono",
                "Control de licencia",
                "Tipo",
                "Nacionalidad",
              ].map((h) => (
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
            {filtered.map((d) => (
              <tr
                key={d.id}
                onClick={() => setDetalle(d)}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_name}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_lastname}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_identification}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_email}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_phone}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_control_number}
                </td>
                <td className="px-5 py-3 text-sm">
                  <Badge size="sm" color="info">
                    {d.driver_license_type}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {d.driver_nationality}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden p-4 space-y-4">
        {filtered.map((d) => (
          <div
            key={d.id}
            onClick={() => setDetalle(d)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 shadow-sm cursor-pointer text-gray-800 dark:text-gray-200"
          >
            <p>
              <strong>Nombre:</strong> {d.driver_name} {d.driver_lastname}
            </p>
            <p>
              <strong>Identificación:</strong> {d.driver_identification}
            </p>
            <p>
              <strong>Control de licencia:</strong> {d.driver_control_number}
            </p>
            <p>
              <strong>Nacionalidad:</strong> {d.driver_nationality}
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
              Detalle del Conductor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-800 dark:text-gray-200">
              <div>
                <h3 className="font-semibold mb-2">Datos personales</h3>
                <p><strong>Nombre:</strong> {detalle.driver_name}</p>
                <p><strong>Apellido:</strong> {detalle.driver_lastname}</p>
                <p><strong>Identificación:</strong> {detalle.driver_identification}</p>
                <p><strong>Teléfono:</strong> {detalle.driver_phone}</p>
                <p><strong>Nacimiento:</strong> {formatDate(detalle.driver_birthdate)}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Datos de la licencia</h3>
                <p><strong>Tipo:</strong> {detalle.driver_license_type}</p>
                <p><strong>Número de control:</strong> {detalle.driver_control_number}</p>
                <p><strong>Expedición:</strong> {formatDate(detalle.driver_license_issue_date)}</p>
                <p><strong>Vencimiento de la licencia:</strong> {formatDate(detalle.driver_license_expiration_date)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-white">
                Documentos
              </h3>
              {detalle.driver_license_file ? (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadFile(detalle.driver_license_file)}
                >
                  Descargar licencia (PDF)
                </Button>
              ) : (
                <p className="text-sm text-gray-500">No hay archivo de licencia.</p>
              )}
              {detalle.driver_identification_file ? (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadFile(detalle.driver_identification_file)}
                >
                  Descargar identificación (PDF)
                </Button>
              ) : (
                <p className="text-sm text-gray-500">No hay archivo de identificación.</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(`/drivers/edit/${detalle.id}`)}
              >
                Editar conductor
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDelete(detalle.id)}
              >
                Eliminar conductor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
