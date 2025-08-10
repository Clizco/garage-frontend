import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosProgressEvent } from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const licenseTypes = ['A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'F', 'G', 'H'];

export default function UpdateDriver() {
  const { id: driverId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    driver_name: '',
    driver_lastname: '',
    driver_identification_type: '',
    driver_identification: '',
    driver_email: '',
    driver_phone: '',
    driver_license_type: [] as string[],
    driver_nationality: '',
    driver_birthdate: '',
    driver_license_issue_date: '',
    driver_license_expiration_date: '',
    driver_control_number: '',
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [currentLicenseName, setCurrentLicenseName] = useState('');
  const [currentIdName, setCurrentIdName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/drivers/drivers/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const {
          driver_license_file,
          driver_identification_file,
          driver_license_type,
          driver_birthdate,
          driver_license_issue_date,
          driver_license_expiration_date,
          ...rest
        } = res.data;

        setForm({
          ...rest,
          driver_license_type: driver_license_type ? driver_license_type.split(',') : [],
          driver_birthdate: formatDate(driver_birthdate),
          driver_license_issue_date: formatDate(driver_license_issue_date),
          driver_license_expiration_date: formatDate(driver_license_expiration_date),
        });

        if (driver_license_file) {
          setCurrentLicenseName(driver_license_file.split('/').pop() || '');
        }

        if (driver_identification_file) {
          setCurrentIdName(driver_identification_file.split('/').pop() || '');
        }
      } catch (err) {
        console.error('Error cargando conductor:', err);
        alert('No se pudo cargar el conductor');
      }
    };

    fetchDriver();
  }, [driverId]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'driver_identification') {
      let maxLength = 11;
      if (form.driver_identification_type === 'CÉDULA') maxLength = 10;
      value = value.slice(0, maxLength);
    }

    if (field === 'driver_control_number') {
      value = value.replace(/[^\d]/g, '').slice(0, 12);
    }

    setForm({ ...form, [field]: value });
  };

  const handleLicenseTypeChange = (type: string) => {
    const updated = form.driver_license_type.includes(type)
      ? form.driver_license_type.filter(t => t !== type)
      : [...form.driver_license_type, type];
    setForm({ ...form, driver_license_type: updated });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'license' | 'id') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      if (type === 'license') setLicenseFile(null);
      else setIdFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 2 MB.');
      if (type === 'license') setLicenseFile(null);
      else setIdFile(null);
      return;
    }

    if (type === 'license') {
      setLicenseFile(file);
      setCurrentLicenseName(file.name);
    } else {
      setIdFile(file);
      setCurrentIdName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emptyField = !form.driver_name || !form.driver_lastname ||
      !form.driver_identification_type || !form.driver_identification ||
      !form.driver_email || !form.driver_phone ||
      form.driver_license_type.length === 0 || !form.driver_nationality ||
      !form.driver_birthdate || !form.driver_license_issue_date ||
      !form.driver_license_expiration_date || !form.driver_control_number;

    if (emptyField) {
      alert('Completa todos los campos.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      for (const key in form) {
        const value = form[key as keyof typeof form];
        if (key === 'driver_license_type') {
          formData.append(key, (value as string[]).join(','));
        } else {
          formData.append(key, String(value));
        }
      }

      if (licenseFile) formData.append('driver_license_file', licenseFile);
      if (idFile) formData.append('driver_identification_file', idFile);

      await axios.put(`${apiUrl}/drivers/drivers/update/${driverId}`, formData, {
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

      alert('¡Conductor actualizado correctamente!');
      setUploadProgress(0);
      navigate('/drivers');
    } catch (err) {
      console.error('Error actualizando conductor:', err);
      alert('Error al actualizar el conductor.');
      setUploadProgress(0);
    }
  };

  return (
    <ComponentCard title="Actualizar Conductor">
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

        <div>
          <Label>Tipo de identificación</Label>
          <select
            value={form.driver_identification_type}
            onChange={(e) => handleChange('driver_identification_type', e.target.value)}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            <option value="">Selecciona un tipo</option>
            <option value="PASAPORTE">PASAPORTE</option>
            <option value="CÉDULA">CÉDULA</option>
            <option value="CARNET DE RESIDENCIA">CARNET DE RESIDENCIA</option>
          </select>
        </div>

        <div>
          <Label>Número de identificación</Label>
          <Input
            value={form.driver_identification}
            placeholder="Ejemplo: E-8-123456 o número de pasaporte"
            type="text"
            onChange={(e) => handleChange('driver_identification', e.target.value)}
          />
        </div>

        <div>
          <Label>Nombre</Label>
          <Input
            value={form.driver_name}
            onChange={(e) => handleChange('driver_name', e.target.value)}
            placeholder="Ingresa el nombre"
            type="text"
          />
        </div>

        <div>
          <Label>Apellido</Label>
          <Input
            value={form.driver_lastname}
            onChange={(e) => handleChange('driver_lastname', e.target.value)}
            placeholder="Ingresa el apellido"
            type="text"
          />
        </div>

        <div>
          <Label>Correo electrónico</Label>
          <Input
            value={form.driver_email}
            onChange={(e) => handleChange('driver_email', e.target.value)}
            placeholder="Ingresa el correo electrónico"
            type="email"
          />
        </div>

        <div>
          <Label>Teléfono</Label>
          <Input
            value={form.driver_phone}
            onChange={(e) => handleChange('driver_phone', e.target.value)}
            placeholder="Ingresa el número de teléfono"
            type="text"
          />
        </div>

        <div>
          <Label>Nacionalidad</Label>
          <select
            value={form.driver_nationality}
            onChange={(e) => handleChange('driver_nationality', e.target.value)}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            <option value="">Selecciona la nacionalidad</option>
            <option value="VENEZUELA">VENEZUELA</option>
            <option value="PANAMÁ">PANAMÁ</option>
            <option value="COLOMBIA">COLOMBIA</option>
          </select>
        </div>

        <div>
          <Label>Fecha de nacimiento</Label>
          <Input
            value={form.driver_birthdate}
            onChange={(e) => handleChange('driver_birthdate', e.target.value)}
            type="date"
          />
        </div>

        <div>
          <Label>Fecha de expedición</Label>
          <Input
            value={form.driver_license_issue_date}
            onChange={(e) => handleChange('driver_license_issue_date', e.target.value)}
            type="date"
          />
        </div>

        <div>
          <Label>Fecha de vencimiento</Label>
          <Input
            value={form.driver_license_expiration_date}
            onChange={(e) => handleChange('driver_license_expiration_date', e.target.value)}
            type="date"
          />
        </div>

        <div>
          <Label>Número de control</Label>
          <Input
            value={form.driver_control_number}
            onChange={(e) => handleChange('driver_control_number', e.target.value)}
            placeholder="Ingresa el número de control (hasta 12 dígitos)"
            type="text"
            inputMode="numeric"
          />
        </div>

        <div>
          <Label>Tipo de licencia</Label>
          <div className="flex flex-wrap gap-3">
            {licenseTypes.map((type) => (
              <label key={type} className="flex items-center gap-1 text-sm text-gray-800 dark:text-white">
                <input
                  type="checkbox"
                  checked={form.driver_license_type.includes(type)}
                  onChange={() => handleLicenseTypeChange(type)}
                  className="w-4 h-4"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Archivos */}
        <div>
          <Label>Licencia (PDF)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'license')}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
          {currentLicenseName && (
            <div className="mt-1 flex gap-3 items-center">
              <p className="text-sm text-green-600">Archivo actual: {currentLicenseName}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${apiUrl}/uploads/drivers/${driverId}/${currentLicenseName}`, '_blank')}
              >
                Ver PDF
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label>Identificación (PDF)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'id')}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
          {currentIdName && (
            <div className="mt-1 flex gap-3 items-center">
              <p className="text-sm text-green-600">Archivo actual: {currentIdName}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${apiUrl}/uploads/drivers/${driverId}/${currentIdName}`, '_blank')}
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
          Actualizar Conductor
        </Button>
      </form>
    </ComponentCard>
  );
}
