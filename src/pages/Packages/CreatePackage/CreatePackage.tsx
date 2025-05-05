import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError, AxiosProgressEvent } from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createPackageUrl = `${apiUrl}/packages/packages/create`;

export default function PrealertPackage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      weight: '',
      unit: 'lb',
      description: '',
      value: '',
      store: '',
    },
  ]);
  const [trackingId, setTrackingId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProductChange = (index: number, field: keyof typeof products[0], value: string) => {
    const updated = [...products];

    if (field === 'weight') {
      const numeric = value.replace(/[^\d]/g, '').slice(0, 5);
      if (numeric.length === 0) {
        updated[index][field] = '';
      } else if (numeric.length <= 2) {
        updated[index][field] = '0.' + numeric.padStart(2, '0');
      } else {
        const intPart = numeric.slice(0, numeric.length - 2).replace(/^0+/, '') || '0';
        const decimalPart = numeric.slice(numeric.length - 2);
        updated[index][field] = `${intPart}.${decimalPart}`;
      }
    } else if (field === 'value') {
      const numeric = value.replace(/[^\d]/g, '').slice(0, 5);
      if (numeric.length === 0) {
        updated[index][field] = '';
      } else if (numeric.length <= 2) {
        updated[index][field] = `$0.${numeric.padStart(2, '0')}`;
      } else {
        const intPart = numeric.slice(0, numeric.length - 2).replace(/^0+/, '') || '0';
        const decimalPart = numeric.slice(numeric.length - 2);
        updated[index][field] = `$${intPart}.${decimalPart}`;
      }
    } else {
      updated[index][field] = value;
    }

    setProducts(updated);
  };

  const addNewProduct = () => {
    setProducts([...products, { weight: '', unit: 'lb', description: '', value: '', store: '' }]);
  };

  const removeProduct = (index: number) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      setInvoiceFile(null);
      setFileName('');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 2 MB.');
      setInvoiceFile(null);
      setFileName('');
      return;
    }

    setInvoiceFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!invoiceFile) return alert('Adjunta la factura para continuar.');
    if (!trackingId.trim()) return alert('Ingresa el Tracking ID.');

    const incomplete = products.some(p =>
      !p.weight || !p.unit || !p.description || !p.value || !p.store
    );
    if (incomplete) return alert('Por favor, completa todos los campos de los productos.');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('decodedToken') || '{}');
      const userId = user.id;

      const formData = new FormData();

      const formattedProducts = products.map((product) => ({
        weight: product.weight,
        unit: product.unit,
        description: product.description,
        value: product.value.replace('$', ''),
        store: product.store,
      }));

      formData.append('products', JSON.stringify(formattedProducts));
      formData.append('trackingId', trackingId);
      formData.append('invoice', invoiceFile);

      await axios.post(`${createPackageUrl}?user_id=${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && progressEvent.loaded) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      alert('¡Productos prealertados exitosamente!');
      setUploadProgress(0);
      navigate('/packages');
    } catch (error) {
      console.error('Error al prealertar productos:', error);
      setUploadProgress(0);
      if (!(error instanceof AxiosError)) {
        alert('Ocurrió un error al enviar los productos.');
      }
    }
  };

  return (
    <ComponentCard title="Prealertar Paquete">
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

        {products.map((product, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-sm relative">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Producto #{index + 1}</h3>

            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="absolute top-2 right-2 text-red-600 dark:text-red-400 hover:underline text-sm"
              >
                Eliminar
              </button>
            )}

            <Label>Peso</Label>
            <div className="flex gap-4 items-center">
              <Input
                value={product.weight}
                onChange={(e) => handleProductChange(index, 'weight', e.target.value)}
                placeholder="Ej: 2.50"
                inputMode="numeric"
              />
              <select
                value={product.unit}
                onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              >
                <option value="lb">lb</option>
                <option value="kg">kg</option>
              </select>
            </div>

            <Label>Descripción</Label>
            <Input
              value={product.description}
              onChange={(e) => handleProductChange(index, 'description', e.target.value)}
            />

            <Label>Valor</Label>
            <Input
              value={product.value}
              onChange={(e) => handleProductChange(index, 'value', e.target.value)}
              placeholder="$"
              inputMode="numeric"
            />

            <Label>Tienda / Proveedor</Label>
            <Input
              value={product.store}
              onChange={(e) => handleProductChange(index, 'store', e.target.value)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addNewProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Agregar otro producto
        </button>

        <div>
          <Label>Tracking ID (único)</Label>
          <Input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Ej: 1Z999AA10123456784"
          />
        </div>

        <div>
          <Label>Factura (PDF para todos los productos)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          />
          {fileName && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Archivo: {fileName}</p>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-blue-600 h-4 rounded-full text-xs text-white text-center transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <Button variant="primary" size="md" className="w-full">
          Prealertar Paquetes
        </Button>
      </form>
    </ComponentCard>
  );
}
