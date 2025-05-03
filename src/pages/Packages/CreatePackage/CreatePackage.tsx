import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createPackageUrl = `${apiUrl}/packages/packages/create`;

export default function PrealertPackage() {
  const navigate = useNavigate();
  const [packageWeight, setPackageWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lb');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageValue, setPackageValue] = useState('');
  const [packageStore, setPackageStore] = useState('');
  const [packageTrackingId, setPackageTrackingId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      e.target.value = '';
      setInvoiceFile(null);
      setFileName('');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 2 MB.');
      e.target.value = '';
      setInvoiceFile(null);
      setFileName('');
      return;
    }

    setInvoiceFile(file);
    setFileName(file.name);
  };

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 2) {
      setPackageWeight(value);
    } else {
      const intPart = value.slice(0, value.length - 2);
      const decimalPart = value.slice(value.length - 2);
      setPackageWeight(`${intPart}.${decimalPart}`);
    }
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 2) {
      setPackageValue(`$${value}`);
    } else {
      const intPart = value.slice(0, value.length - 2);
      const decimalPart = value.slice(value.length - 2);
      setPackageValue(`$${intPart}.${decimalPart}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !packageWeight ||
      !packageDescription ||
      !packageValue ||
      !packageStore ||
      !packageTrackingId ||
      !invoiceFile
    ) {
      alert('Por favor, completa todos los campos antes de enviar.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('decodedToken') || '{}');
      const userId = user.id;

      const fullWeight = `${packageWeight} ${weightUnit}`;
      const cleanPackageValue = packageValue.replace('$', '');

      const formData = new FormData();
      formData.append('package_weight', fullWeight);
      formData.append('package_description', packageDescription);
      formData.append('package_value', cleanPackageValue);
      formData.append('package_store', packageStore);
      formData.append('package_status', 'Pending');
      formData.append('package_tracking_id', packageTrackingId);
      formData.append('user_id', userId.toString());
      formData.append('invoice', invoiceFile);

    await axios.post(`${createPackageUrl}?user_id=${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: ProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      },
    } as any); // Explicitly cast to 'any' to include onUploadProgress

      alert('¡Paquete prealertado exitosamente!');
      setUploadProgress(0); // Reinicia progreso
      navigate('/packages');
    } catch (error) {
      console.error('Error al prealertar paquete:', error);
      setUploadProgress(0); // Reinicia en error

      if (error instanceof AxiosError && error.response) {
      } else {
        alert('Hubo un error al prealertar el paquete.');
      }
    }
  };

  return (
    <ComponentCard title="Prealertar Paquete">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="packageWeight">Peso</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="packageWeight"
              value={packageWeight}
              onChange={handleWeightChange}
              placeholder="Ingrese el peso"
              aria-required="true"
              type="text"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-theme-sm">
                <input
                  type="radio"
                  name="weightUnit"
                  value="lb"
                  checked={weightUnit === 'lb'}
                  onChange={(e) => setWeightUnit(e.target.value)}
                />
                lb
              </label>
              <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-theme-sm">
                <input
                  type="radio"
                  name="weightUnit"
                  value="kg"
                  checked={weightUnit === 'kg'}
                  onChange={(e) => setWeightUnit(e.target.value)}
                />
                kg
              </label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="packageDescription">Descripción</Label>
          <Input
            id="packageDescription"
            value={packageDescription}
            onChange={(e) => setPackageDescription(e.target.value)}
            placeholder="Ingrese una breve descripción"
          />
        </div>

        <div>
          <Label htmlFor="packageValue">Valor</Label>
          <Input
            id="packageValue"
            value={packageValue}
            onChange={handleValueChange}
            placeholder="Ingrese el valor declarado"
          />
        </div>

        <div>
          <Label htmlFor="packageStore">Tienda / Proveedor</Label>
          <Input
            id="packageStore"
            value={packageStore}
            onChange={(e) => setPackageStore(e.target.value)}
            placeholder="Nombre de la tienda"
          />
        </div>

        <div>
          <Label htmlFor="packageTrackingId">Tracking ID</Label>
          <Input
            id="packageTrackingId"
            value={packageTrackingId}
            onChange={(e) => setPackageTrackingId(e.target.value)}
            placeholder="Ej: 1Z999AA10123456784"
            aria-required="true"
          />
        </div>

        <div>
          <Label htmlFor="invoice">Adjuntar Factura (PDF)</Label>
          <input
            id="invoice"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          />
          {fileName && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Archivo seleccionado: {fileName}
            </p>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mt-2">
            <div
              className="bg-blue-600 h-4 rounded-full text-xs text-white text-center transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <div className="flex items-center justify-start gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Volver
          </button>
          <Button variant="primary" size="md">
            Prealertar Paquete
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
