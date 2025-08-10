import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createReportUrl = `${apiUrl}/workshop-reports/workshop-reports/create`;

interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

export default function CreateWorkshopReport() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicle_id: '',
    report_date: new Date(),
    report_time: '',
    report_details: '',
    report_part_details: ''
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [filteredPlacas, setFilteredPlacas] = useState<Vehicle[]>([]);
  const [showDropdownPlaca, setShowDropdownPlaca] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/vehicles/vehicles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data);
      } catch (err) {
        console.error('Error al cargar vehículos:', err);
      }
    };

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setForm((prev) => ({
      ...prev,
      report_date: now,
      report_time: `${hours}:${minutes}`
    }));

    fetchVehicles();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.vehicle_id || !form.report_details || !form.report_part_details) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        createReportUrl,
        {
          vehicle_id: form.vehicle_id,
          report_date: form.report_date.toISOString().split('T')[0],
          report_time: form.report_time,
          report_details: form.report_details,
          report_part_details: form.report_part_details
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡Reporte del taller creado correctamente!');
      navigate('/workshop-reports');
    } catch (error) {
      console.error('Error al registrar reporte:', error);
      setErrorMessage('Hubo un error al registrar el reporte.');
    }
  };

  return (
    <ComponentCard title="Registrar Reporte del Taller">
      <form onSubmit={handleSubmit} className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 dark:hover:bg-blue-600"
        >
          Volver
        </button>

        {/* Placa */}
        <div className="relative">
          <Label className="dark:text-gray-300">Placa</Label>
          <input
            type="text"
            placeholder="Buscar placa..."
            value={searchPlaca}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSearchPlaca(val);
              setForm({ ...form, vehicle_id: '' });
              setSelectedVehicle(null);
              const matches = vehicles.filter(v => v.placa.toUpperCase().includes(val));
              setFilteredPlacas(matches);
            }}
            onFocus={() => setShowDropdownPlaca(true)}
            onBlur={() => setTimeout(() => setShowDropdownPlaca(false), 150)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
          {showDropdownPlaca && filteredPlacas.length > 0 && (
            <ul className="absolute bg-white dark:bg-gray-800 border rounded w-full max-h-40 overflow-y-auto z-10 dark:border-white/10">
              {filteredPlacas.map(v => (
                <li key={v.id} onMouseDown={() => {
                  setForm({ ...form, vehicle_id: v.id.toString() });
                  setSelectedVehicle(v);
                  setSearchPlaca(v.placa);
                  setShowDropdownPlaca(false);
                }} className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-600 cursor-pointer text-sm dark:text-white">
                  {v.placa}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedVehicle && (
          <div>
            <Label className="dark:text-gray-300">Marca y modelo</Label>
            <input
              type="text"
              disabled
              value={`${selectedVehicle.marca} ${selectedVehicle.modelo}`}
              className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
            />
          </div>
        )}

        {/* Fecha (no editable) */}
        <div>
          <Label className="dark:text-gray-300">Fecha</Label>
          <input
            type="text"
            disabled
            value={form.report_date.toLocaleDateString('es-ES')}
            className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

        {/* Hora (no editable) */}
        <div>
          <Label className="dark:text-gray-300">Hora</Label>
          <input
            type="text"
            disabled
            value={form.report_time}
            className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
          />
        </div>

        {/* Detalles del reporte */}
        <div>
          <Label className="dark:text-gray-300">Descripcion General</Label>
          <textarea
            value={form.report_details}
            onChange={(e) => setForm({ ...form, report_details: e.target.value })}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Detalles de partes */}
        <div>
          <Label className="dark:text-gray-300">Descripcion de Partes</Label>
          <textarea
            value={form.report_part_details}
            onChange={(e) => setForm({ ...form, report_part_details: e.target.value })}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <Button variant="primary" size="md" className="w-full dark:hover:bg-blue-600">
          Registrar Reporte
        </Button>

        {errorMessage && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errorMessage}</p>
        )}
      </form>
    </ComponentCard>
  );
}
