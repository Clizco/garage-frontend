import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createDriverUrl = `${apiUrl}/drivers/drivers/create`;

const licenseTypes = ['A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'F', 'G', 'H'];

export default function CreateDriver() {
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (field: string, value: string) => {
    if (field === 'driver_identification') {
      const type = form.driver_identification_type;
      let maxLength = 11;
      if (type === 'CÉDULA') maxLength = 10;
      value = value.slice(0, maxLength);
    }

    if (field === 'driver_control_number') {
      value = value.replace(/[^\d]/g, '').slice(0, 12);
    }

    setForm({ ...form, [field]: value });
  };

  const handleLicenseTypeChange = (value: string) => {
    const updated = form.driver_license_type.includes(value)
      ? form.driver_license_type.filter((t) => t !== value)
      : [...form.driver_license_type, value];

    setForm({ ...form, driver_license_type: updated });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'license' | 'id'
  ) => {
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

    if (type === 'license') setLicenseFile(file);
    else setIdFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.driver_identification_type) {
      alert('Selecciona un tipo de identificación.');
      return;
    }

    if (form.driver_license_type.length === 0) {
      alert('Selecciona al menos un tipo de licencia.');
      return;
    }

    if (!licenseFile) return alert('Adjunta el archivo de licencia.');
    if (!idFile) return alert('Adjunta el archivo de identificación.');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      for (const key in form) {
        if (key === 'driver_license_type') {
          formData.append(key, form.driver_license_type.join(','));
        } else {
          formData.append(key, form[key as keyof typeof form] as string);
        }
      }

      formData.append('driver_license_file', licenseFile);
      formData.append('driver_identification_file', idFile);

      await axios.post(createDriverUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.loaded) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      alert('¡Conductor registrado correctamente!');
      navigate('/drivers');
    } catch (error) {
      console.error('Error al registrar conductor:', error);
      alert('Hubo un error al registrar el conductor.');
      setUploadProgress(0);
    }
  };

  const fieldLabels: Record<string, string> = {
    driver_name: 'Nombre',
    driver_lastname: 'Apellido',
    driver_email: 'Correo electrónico',
    driver_phone: 'Número de teléfono',
    driver_nationality: 'Nacionalidad',
    driver_birthdate: 'Fecha de nacimiento',
    driver_license_issue_date: 'Fecha de expedición',
    driver_license_expiration_date: 'Fecha de vencimiento',
    driver_control_number: 'Número de control',
  };

  const fieldPlaceholders: Record<string, string> = {
    driver_name: 'Ingresa el nombre',
    driver_lastname: 'Ingresa el apellido',
    driver_email: 'Ingresa el correo electrónico',
    driver_phone: 'Ingresa el número de teléfono',
    driver_nationality: '',
    driver_birthdate: '',
    driver_license_issue_date: '',
    driver_license_expiration_date: '',
    driver_control_number: 'Ingresa el número de control (máx 12 dígitos)',
  };

  return (
    <ComponentCard title="Registrar Conductor">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
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
            required
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
            onChange={(e) => handleChange('driver_identification', e.target.value)}
            placeholder="Ingresa el número de identificación"
            type="text"
          />
        </div>

        <div>
          <Label>Nacionalidad</Label>
          <select
            value={form.driver_nationality}
            onChange={(e) => handleChange('driver_nationality', e.target.value)}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          >
            <option value="">Selecciona la nacionalidad</option>
            <option value="VENEZUELA">VENEZUELA</option>
            <option value="PANAMÁ">PANAMÁ</option>
            <option value="COLOMBIA">COLOMBIA</option>
          </select>
        </div>

        {Object.entries(form).map(([key, value]) =>
          !['driver_identification', 'driver_identification_type', 'driver_license_type', 'driver_nationality'].includes(key) ? (
            <div key={key}>
              <Label>{fieldLabels[key]}</Label>
              <Input
                value={Array.isArray(value) ? value.join(', ') : value || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={fieldPlaceholders[key]}
                type={key.includes('date') ? 'date' : 'text'}
                inputMode={key === 'driver_control_number' ? 'numeric' : undefined}
              />
            </div>
          ) : null
        )}

        <div>
          <Label>Tipo de licencia</Label>
          <div className="flex flex-wrap gap-3">
            {licenseTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-1 text-sm text-gray-800 dark:text-white"
              >
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

        <div>
          <Label>Licencia (PDF)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'license')}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          />
        </div>

        <div>
          <Label>Identificación (PDF)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'id')}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          />
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
          Registrar Conductor
        </Button>
      </form>
    </ComponentCard>
  );
}
