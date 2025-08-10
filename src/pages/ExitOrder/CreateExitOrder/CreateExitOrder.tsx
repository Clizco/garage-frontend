import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createExitOrderUrl = `${apiUrl}/exit-orders/exit-orders/create`;

interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

interface Driver {
  id: number;
  driver_name: string;
  driver_lastname: string;
  driver_control_number: string;
}

interface Client {
  id: number;
  client_name: string;
}

export default function CreateExitOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicle_id: '',
    driver_id: '',
    client_id: '',
    exit_date: null as Date | null,
    entry_date: null as Date | null,
    exit_time: '',
    entry_time: '',
    exit_reason: ''
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [searchPlaca, setSearchPlaca] = useState('');
  const [filteredPlacas, setFilteredPlacas] = useState<Vehicle[]>([]);
  const [showDropdownPlaca, setShowDropdownPlaca] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [searchLicense, setSearchLicense] = useState('');
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [showDropdownDriver, setShowDropdownDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [searchClient, setSearchClient] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showDropdownClient, setShowDropdownClient] = useState(false);

  const [daysDiff, setDaysDiff] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [vRes, dRes, cRes] = await Promise.all([
          axios.get(`${apiUrl}/vehicles/vehicles/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/drivers/drivers/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/clients/clients/all`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setVehicles(vRes.data);
        setDrivers(dRes.data);
        setClients(cRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    fetchData();
  }, []);

  const handleDateDiff = (exit: Date | null, entry: Date | null) => {
    if (exit && entry) {
      const diff = Math.ceil((entry.getTime() - exit.getTime()) / (1000 * 60 * 60 * 24));
      setDaysDiff(diff);
    } else {
      setDaysDiff(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !form.vehicle_id ||
      !form.driver_id ||
      !form.client_id ||
      !form.exit_date ||
      !form.entry_date ||
      !form.exit_time ||
      !form.entry_time
    ) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    const exitDateTime = new Date(
      `${form.exit_date.toISOString().split('T')[0]}T${form.exit_time}`
    );
    const entryDateTime = new Date(
      `${form.entry_date.toISOString().split('T')[0]}T${form.entry_time}`
    );

    if (entryDateTime.getTime() < exitDateTime.getTime() + 24 * 60 * 60 * 1000) {
      setErrorMessage('La fecha y hora de entrada debe ser al menos 24 horas después de la salida');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        createExitOrderUrl,
        {
          ...form,
          exit_date: form.exit_date.toISOString().split('T')[0],
          entry_date: form.entry_date.toISOString().split('T')[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡Orden de salida registrada correctamente!');
      navigate('/exit-orders');
    } catch (error) {
      console.error('Error al registrar orden de salida:', error);
      setErrorMessage('Hubo un error al registrar la orden de salida.');
    }
  };

  return (
    <ComponentCard title="Registrar Orden de Salida">
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

        {/* Conductor */}
        <div className="relative">
          <Label className="dark:text-gray-300">Número de Licencia</Label>
          <input
            type="text"
            placeholder="Buscar licencia..."
            value={searchLicense}
            onChange={(e) => {
              const val = e.target.value;
              setSearchLicense(val);
              setForm({ ...form, driver_id: '' });
              setSelectedDriver(null);
              const matches = drivers.filter(d => d.driver_control_number.includes(val));
              setFilteredDrivers(matches);
            }}
            onFocus={() => setShowDropdownDriver(true)}
            onBlur={() => setTimeout(() => setShowDropdownDriver(false), 150)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
          {showDropdownDriver && filteredDrivers.length > 0 && (
            <ul className="absolute bg-white dark:bg-gray-800 border rounded w-full max-h-40 overflow-y-auto z-10 dark:border-white/10">
              {filteredDrivers.map(d => (
                <li key={d.id} onMouseDown={() => {
                  setForm({ ...form, driver_id: d.id.toString() });
                  setSelectedDriver(d);
                  setSearchLicense(d.driver_control_number);
                  setShowDropdownDriver(false);
                }} className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-600 cursor-pointer text-sm dark:text-white">
                  {d.driver_control_number} - {d.driver_name} {d.driver_lastname}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedDriver && (
          <div>
            <Label className="dark:text-gray-300">Nombre del conductor</Label>
            <input
              type="text"
              disabled
              value={`${selectedDriver.driver_name} ${selectedDriver.driver_lastname}`}
              className="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
            />
          </div>
        )}

        {/* Cliente */}
        <div className="relative">
          <Label className="dark:text-gray-300">Cliente</Label>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchClient}
            onChange={(e) => {
              const val = e.target.value;
              setSearchClient(val);
              setForm({ ...form, client_id: '' });
              const matches = clients.filter(c => c.client_name.toLowerCase().includes(val.toLowerCase()));
              setFilteredClients(matches);
            }}
            onFocus={() => setShowDropdownClient(true)}
            onBlur={() => setTimeout(() => setShowDropdownClient(false), 150)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          />
          {showDropdownClient && filteredClients.length > 0 && (
            <ul className="absolute bg-white dark:bg-gray-800 border rounded w-full max-h-40 overflow-y-auto z-10 dark:border-white/10">
              {filteredClients.map(c => (
                <li key={c.id} onMouseDown={() => {
                  setForm({ ...form, client_id: c.id.toString() });
                  setSearchClient(c.client_name);
                  setShowDropdownClient(false);
                }} className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-600 cursor-pointer text-sm dark:text-white">
                  {c.client_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fechas + horas */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <Label className="dark:text-gray-300">Fecha de salida</Label>
            <DatePicker
              selected={form.exit_date}
              onChange={(date) => {
                setForm({ ...form, exit_date: date });
                handleDateDiff(date, form.entry_date);
              }}
              dateFormat="dd/MM/yyyy"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="w-1/2">
            <Label className="dark:text-gray-300">Hora de salida</Label>
            <Input
              type="time"
              value={form.exit_time.slice(0, 5)}
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, exit_time: val.length === 5 ? `${val}:00` : val });
              }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <Label className="dark:text-gray-300">Fecha de entrada</Label>
            <DatePicker
              selected={form.entry_date}
              onChange={(date) => {
                setForm({ ...form, entry_date: date });
                handleDateDiff(form.exit_date, date);
              }}
              dateFormat="dd/MM/yyyy"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="w-1/2">
            <Label className="dark:text-gray-300">Hora de entrada</Label>
            <Input
              type="time"
              value={form.entry_time.slice(0, 5)}
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, entry_time: val.length === 5 ? `${val}:00` : val });
              }}
            />
          </div>
        </div>

        {daysDiff !== null && (
          <p className="text-sm mt-1 text-gray-700 dark:text-white">
            Duración: {daysDiff} {daysDiff === 1 ? 'día' : 'días'}
          </p>
        )}

        <div>
          <Label className="dark:text-gray-300">Número de Referencia</Label>
          <Input
            type="text"
            value={form.exit_reason}
            onChange={(e) => setForm({ ...form, exit_reason: e.target.value })}
            placeholder="Ingresa la Referencia"
          />
        </div>

        <Button variant="primary" size="md" className="w-full dark:hover:bg-blue-600">
          Registrar Orden de Salida
        </Button>

        {errorMessage && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errorMessage}</p>
        )}
      </form>
    </ComponentCard>
  );
}
