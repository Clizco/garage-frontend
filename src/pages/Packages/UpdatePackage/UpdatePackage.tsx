import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosProgressEvent } from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';

interface Product {
  id?: number;
  weight: string;
  unit: string;
  description: string;
  value: string;
  store: string;
}

export default function UpdatePackage() {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [trackingId, setTrackingId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/packages/packages/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const formattedProducts = (data.products || []).map((p: any) => ({
          id: p.id,
          weight: p.product_weight,
          unit: p.product_unit,
          description: p.product_description,
          value: `$${parseFloat(p.product_value).toFixed(2)}`,
          store: p.product_store,
        }));

        setProducts(formattedProducts);
        setTrackingId(data.package_tracking_id || '');
        setFileName(data.invoice_path?.split('/').pop() || '');
      } catch (err) {
        console.error('Error cargando paquete:', err);
        alert('No se pudo cargar el paquete');
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleProductChange = (index: number, field: keyof Product, value: string) => {
      const updated = [...products];
      const numeric = value.replace(/[^\d]/g, '').slice(0, 5);
  
      if (field === 'weight') {
        updated[index][field] =
          numeric.length <= 2 ? `0.${numeric.padStart(2, '0')}` : `${numeric.slice(0, -2)}.${numeric.slice(-2)}`;
      } else if (field === 'value') {
        updated[index][field] =
          numeric.length <= 2 ? `$0.${numeric.padStart(2, '0')}` : `$${numeric.slice(0, -2)}.${numeric.slice(-2)}`;
      } else if (
        field === 'unit' ||
        field === 'description' ||
        field === 'store'
      ) {
        updated[index][field] = value;
      }
  
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
      alert('Archivo muy grande (máx. 2MB)');
      setInvoiceFile(null);
      setFileName('');
      return;
    }

    setInvoiceFile(file);
    setFileName(file.name);
  };

  const addNewProduct = () => {
    setProducts([...products, { weight: '', unit: 'lb', description: '', value: '', store: '' }]);
  };

  const removeProduct = (index: number) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const incomplete = products.some(p =>
      !p.weight || !p.unit || !p.description || !p.value || !p.store
    );
    if (!trackingId.trim()) return alert('Tracking ID requerido.');
    if (incomplete) return alert('Completa todos los campos de los productos.');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('decodedToken') || '{}');
      const userId = user.id;

      const formData = new FormData();
      const formattedProducts = products.map(p => ({
        ...p,
        value: p.value.replace('$', ''),
      }));

      formData.append('products', JSON.stringify(formattedProducts));
      formData.append('trackingId', trackingId);
      if (invoiceFile) formData.append('invoice', invoiceFile);

      await axios.put(`${apiUrl}/packages/packages/update/${packageId}?user_id=${userId}`, formData, {
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

      alert('¡Paquete actualizado!');
      setUploadProgress(0);
      navigate('/packages');
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      setUploadProgress(0);
      alert('Ocurrió un error al actualizar el paquete.');
    }
  };

  return (
    <ComponentCard title="Actualizar Paquete">
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

        {products.map((product, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50 dark:bg-gray-800 shadow relative">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Producto #{index + 1}</h3>

            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="absolute top-2 right-2 text-red-600 text-sm"
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
          <Label>Tracking ID</Label>
          <Input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Ej: 1Z999AA10123456784"
          />
        </div>

        <div>
          <Label>Factura PDF (opcional)</Label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
          {fileName && (
            <p className="text-sm text-green-600 mt-1">Archivo actual: {fileName}</p>
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
          Actualizar Paquete
        </Button>
      </form>
    </ComponentCard>
  );
}
