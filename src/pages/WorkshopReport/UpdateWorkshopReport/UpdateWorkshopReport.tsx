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

export default function UpdateWorkshopReport() {
  const { id: reportId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vehicle_id: '',
    report_date: null as Date | null,
    report_time: '',
    report_details: '',
    report_part_details: ''
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
        const [reportRes, vRes] = await Promise.all([
          axios.get(`${apiUrl}/workshop-reports/workshop-reports/vehicle/${reportId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/vehicles/vehicles/all`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const r = reportRes.data[0];
        setForm({
          vehicle_id: r.vehicle_id.toString(),
          report_date: r.report_date ? new Date(r.report_date) : null,
          report_time: r.report_time,
          report_details: r.report_details,
          report_part_details: r.report_part_details
        });

        setVehicles(vRes.data);

        const foundVehicle = vRes.data.find((v: Vehicle) => v.id === r.vehicle_id);
        setSearchPlaca(foundVehicle?.placa || '');
        setSelectedVehicle(foundVehicle || null);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        toast.error('No se pudo cargar el reporte del taller.');
      }
    };

    fetchData();
  }, [reportId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.vehicle_id || !form.report_date || !form.report_time || !form.report_details || !form.report_part_details) {
      toast.warn('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/workshop-reports/workshop-reports/update/${reportId}`, {
        vehicle_id: form.vehicle_id,
        report_date: form.report_date.toISOString().split('T')[0],
        report_time: form.report_time,
        report_details: form.report_details,
        report_part_details: form.report_part_details
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('¡Reporte del taller actualizado correctamente!');
      setTimeout(() => navigate('/workshop-reports'), 1500);
    } catch (err) {
      console.error('Error al actualizar reporte:', err);
      toast.error('Hubo un error al actualizar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ComponentCard title="Actualizar Reporte del Taller">
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

          {/* Fecha */}
          <div>
            <Label className="dark:text-gray-300">Fecha</Label>
            <DatePicker
              selected={form.report_date}
              onChange={(date) => setForm({ ...form, report_date: date })}
              dateFormat="dd/MM/yyyy"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Hora */}
          <div>
            <Label className="dark:text-gray-300">Hora</Label>
            <input
              type="time"
              value={form.report_time}
              onChange={(e) => setForm({ ...form, report_time: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Detalles del reporte */}
          <div>
            <Label className="dark:text-gray-300">Detalles del reporte</Label>
            <textarea
              value={form.report_details}
              onChange={(e) => setForm({ ...form, report_details: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Detalles de partes */}
          <div>
            <Label className="dark:text-gray-300">Piezas faltantes</Label>
            <textarea
              value={form.report_part_details}
              onChange={(e) => setForm({ ...form, report_part_details: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          <Button variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar Reporte'}
          </Button>
        </form>
      </ComponentCard>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </>
  );
}
