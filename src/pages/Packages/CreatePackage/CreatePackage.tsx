import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
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
      formData.append('user_id', userId);
      if (invoiceFile) {
        formData.append('invoice', invoiceFile);
      }

      await axios.post(createPackageUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('¡Paquete prealertado exitosamente!');
      navigate('/packages');
    } catch (error) {
      console.error('Error al prealertar paquete:', error);
      alert('Hubo un error al prealertar el paquete.');
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
            <Label htmlFor="invoice">Adjuntar Factura (PDF)</Label>
            <input
                id="invoice"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
        </div>


        <div className="flex items-center justify-start gap-4 mt-4">
            <div className="flex justify-start">
          <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            >
                Volver
            </button>
            </div>
          <Button variant="primary" size="md">
            Prealertar Paquete
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
