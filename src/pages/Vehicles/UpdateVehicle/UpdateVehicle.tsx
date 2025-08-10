import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosProgressEvent } from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';

const meses = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const municipios = ['PANAMA', 'CHITRE', 'SAN MIGUELITO'];

export default function UpdateVehicle() {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<string, string>>({
    placa: '',
    vin: '',
    ubicacion: '',
    propietario: '',
    municipio: '',
    mes_de_placa: '',
    marca: '',
    modelo: '',
    capacidad: '',
    ton: '',
    year: '',
    uso: '',
    precio: '',
  });

  const [ruvFile, setRuvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/vehicles/${vehicleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { id, created_at, ruv, ruv_path, ...rest } = res.data;

        const formattedForm: Record<string, string> = Object.fromEntries(
          Object.entries(rest).map(([key, val]) => [key, String(val ?? '')])
        );

        formattedForm.precio = formatWithThousands(res.data.precio?.toString() || '0');
        formattedForm.ton = parseFloat(res.data.ton || '0').toFixed(2);

        setForm(formattedForm);

        const ruvFilePath = ruv_path || ruv;
        if (ruvFilePath) {
          setFileName(ruvFilePath.split('/').pop() || '');
        }
      } catch (err) {
        console.error('Error cargando vehículo:', err);
        alert('No se pudo cargar el vehículo');
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const formatWithThousands = (value: string): string => {
    const numeric = value.replace(/[^\d]/g, '');
    if (!numeric) return '';
    const intPart = numeric.slice(0, -2).replace(/^0+/, '') || '0';
    const decimalPart = numeric.slice(-2);
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${withCommas}.${decimalPart}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'precio') {
      const numeric = value.replace(/[^\d]/g, '').slice(0, 11);
      const padded = numeric.padStart(3, '0');
      setForm({ ...form, [field]: formatWithThousands(padded) });
    } else if (field === 'ton') {
      const numeric = value.replace(/[^\d]/g, '').slice(0, 5);
      if (!numeric) {
        setForm({ ...form, [field]: '' });
      } else if (numeric.length <= 2) {
        setForm({ ...form, [field]: '0.' + numeric.padStart(2, '0') });
      } else {
        const intPart = numeric.slice(0, -2).replace(/^0+/, '') || '0';
        const decimalPart = numeric.slice(-2);
        setForm({ ...form, [field]: `${intPart}.${decimalPart}` });
      }
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      setRuvFile(null);
      setFileName('');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 2 MB.');
      setRuvFile(null);
      setFileName('');
      return;
    }

    setRuvFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emptyField = Object.entries(form).some(([key, value]) => {
      const trimmed = String(value).trim();
      if (key === 'vin') return false;
      if (!trimmed) return true;
      if (key === 'ton' && isNaN(parseFloat(trimmed))) return true;
      if (key === 'precio' && isNaN(parseFloat(trimmed.replace(/[$,]/g, '')))) return true;
      return false;
    });

    if (emptyField) {
      alert('Completa todos los campos y asegúrate de que el precio y tonelaje sean mayores a 0.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      const cleanForm: Record<string, string> = {
        ...form,
        precio: form.precio.replace(/[$,]/g, ''),
      };

      for (const key in cleanForm) {
        formData.append(key, cleanForm[key]);
      }

      if (ruvFile) formData.append('ruv', ruvFile);

      await axios.put(`${apiUrl}/vehicles/vehicles/update/${vehicleId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total && e.loaded) {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      alert('¡Vehículo actualizado correctamente!');
      setUploadProgress(0);
      navigate('/vehicles');
    } catch (err) {
      console.error('Error actualizando vehículo:', err);
      alert('Error al actualizar el vehículo.');
      setUploadProgress(0);
    }
  };

  return (
    <ComponentCard title="Actualizar Vehículo">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver
          </button>
        </div>

        {Object.entries(form).map(([key, value]) => (
          key === 'mes_de_placa' ? (
            <div key={key}>
              <Label>{key.replace(/_/g, ' ').toUpperCase()}</Label>
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              >
                <option value="">Selecciona un mes</option>
                {meses.map((mes) => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>
          ) : key === 'municipio' ? (
            <div key={key}>
              <Label>{key.replace(/_/g, ' ').toUpperCase()}</Label>
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              >
                <option value="">Selecciona un municipio</option>
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
              </select>
            </div>
          ) : (
            <div key={key}>
              <Label>{key.replace(/_/g, ' ').toUpperCase()}</Label>
              <Input
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={
                  key === 'precio' ? '$' :
                  key === 'ton' ? 'Ej: 1.50' :
                  `Ingresa ${key}`
                }
                inputMode={key === 'ton' || key === 'precio' ? 'numeric' : undefined}
                type="text"
              />
            </div>
          )
        ))}

        <div>
          <Label>RUV (PDF) (opcional)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
          {fileName && (
            <div className="mt-1 flex gap-3 items-center">
              <p className="text-sm text-green-600">Archivo actual: {fileName}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${apiUrl}/uploads/${vehicleId}/${fileName}`, '_blank')}
              >
                Ver PDF
              </Button>
            </div>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-blue-600 h-4 rounded-full text-xs text-white text-center transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <Button variant="primary" size="md" className="w-full">
          Actualizar Vehículo
        </Button>
      </form>
    </ComponentCard>
  );
}
