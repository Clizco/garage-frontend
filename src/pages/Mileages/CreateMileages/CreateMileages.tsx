import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createMilageUrl = `${apiUrl}/milages/milages/create`;

interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

export default function CreateMilage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicle_id: '',
    mileage: '', // guardamos raw: solo dígitos
    date: null as Date | null,
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
    fetchVehicles();
  }, []);

  const formatKilometraje = (value: string) => {
    if (!value) return "";
    const intVal = value.slice(0, -2) || "0";
    const decimalVal = value.slice(-2).padStart(2, '0');
    const intFormatted = parseInt(intVal, 10).toLocaleString();
    return `${intFormatted}.${decimalVal}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.vehicle_id || !form.mileage || !form.date) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        createMilageUrl,
        {
          vehicle_id: form.vehicle_id,
          mileage: parseFloat(form.mileage) / 100, // convierte raw a decimal
          date: form.date.toISOString().split('T')[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡Registro de kilometraje creado correctamente!');
      navigate('/milages');
    } catch (error) {
      console.error('Error al registrar kilometraje:', error);
      setErrorMessage('Hubo un error al registrar el kilometraje.');
    }
  };

  return (
    <ComponentCard title="Registrar Kilometraje">
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

        {/* Kilometraje */}
        <div>
          <Label className="dark:text-gray-300">Kilometraje</Label>
          <input
            type="text"
            value={formatKilometraje(form.mileage)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').substring(0, 10);
              setForm({ ...form, mileage: raw });
            }}
            placeholder="Ej: 999,999.99"
            inputMode="numeric"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Fecha */}
        <div>
          <Label className="dark:text-gray-300">Fecha</Label>
          <DatePicker
            selected={form.date}
            onChange={(date) => setForm({ ...form, date })}
            dateFormat="dd/MM/yyyy"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <Button variant="primary" size="md" className="w-full dark:hover:bg-blue-600">
          Registrar Kilometraje
        </Button>

        {errorMessage && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errorMessage}</p>
        )}
      </form>
    </ComponentCard>
  );
}
