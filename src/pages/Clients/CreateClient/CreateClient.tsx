import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';
const createClientUrl = `${apiUrl}/clients/clients/create`;

export default function CreateClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client_name: '',
    client_ruc: '',
    client_type: ''
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.client_name || !form.client_ruc || !form.client_type) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(createClientUrl, form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('¡Cliente registrado correctamente!');
      navigate('/clients');
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      alert('Hubo un error al registrar el cliente.');
    }
  };

  return (
    <ComponentCard title="Registrar Cliente">
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
          <Label>Nombre de la Empresa</Label>
          <Input
            value={form.client_name}
            onChange={(e) => handleChange('client_name', e.target.value)}
            placeholder="Ingresa el nombre de la empresa"
            type="text"
          />
        </div>

        <div>
          <Label>RUC</Label>
          <Input
            value={form.client_ruc}
            onChange={(e) => handleChange('client_ruc', e.target.value)}
            placeholder="Ingresa el RUC"
            type="text"
          />
        </div>

        <div>
          <Label>Tipo</Label>
          <select
            value={form.client_type}
            onChange={(e) => handleChange('client_type', e.target.value)}
            className="border rounded px-3 py-2 w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            required
          >
            <option value="">Selecciona el tipo de cliente</option>
            <option value="Jurídica"> Jurídica</option>
            <option value="Personal"> Personal</option>
          </select>
        </div>

        <Button variant="primary" size="md" className="w-full">
          Registrar Cliente
        </Button>
      </form>
    </ComponentCard>
  );
}
