import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';

const apiUrl = import.meta.env.VITE_API_URL || '';

interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

export default function UpdateMilage() {
  const { id: milageId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vehicle_id: '',
    mileage: '',
    date: null as Date | null,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [filteredPlacas, setFilteredPlacas] = useState<Vehicle[]>([]);
  const [showDropdownPlaca, setShowDropdownPlaca] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [milageRes, vRes] = await Promise.all([
          axios.get(`${apiUrl}/milages/milages/vehicle/${milageId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/vehicles/vehicles/all`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const m = milageRes.data[0];
          setForm({
            vehicle_id: m.vehicle_id.toString(),
            mileage: m.mileage.toString(),
            date: m.date ? new Date(m.date) : null,
          });


        setVehicles(vRes.data);

        const foundVehicle = vRes.data.find((v: Vehicle) => v.id === m.vehicle_id);
        setSearchPlaca(foundVehicle?.placa || '');
        setSelectedVehicle(foundVehicle || null);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        toast.error('No se pudo cargar el registro de kilometraje.');
      }
    };

    fetchData();
  }, [milageId]);

  
    const formatKilometraje = (value: string) => {
      if (!value) return '';
      const number = parseInt(value, 10);
      return number.toLocaleString('es-ES');
    };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.vehicle_id || !form.mileage || !form.date) {
      toast.warn('Todos los campos son obligatorios');
      return;
    }

    if (isNaN(parseInt(form.mileage)) || parseInt(form.mileage) < 0) {
      toast.warn('El kilometraje debe ser un número válido y positivo');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/milages/milages/update/${milageId}`, {
        vehicle_id: form.vehicle_id,
        mileage: parseInt(form.mileage),
        date: form.date.toISOString().split('T')[0],
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('¡Kilometraje actualizado correctamente!');
      setTimeout(() => navigate('/milages'), 1500);
    } catch (err) {
      console.error('Error al actualizar kilometraje:', err);
      toast.error('Hubo un error al actualizar el kilometraje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ComponentCard title="Actualizar Kilometraje">
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

          <Button variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar Kilometraje'}
          </Button>
        </form>
      </ComponentCard>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  );
}
