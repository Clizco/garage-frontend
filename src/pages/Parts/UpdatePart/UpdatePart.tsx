import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

const apiUrl = import.meta.env.VITE_API_URL || '';

export default function UpdatePart() {
  const { id: partId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    part_name: '',
    part_number: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    const fetchPart = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/parts/parts/${partId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('RESPUESTA:', res.data);

        const { part_name, part_number, quantity, price } = res.data;

        setForm({
          part_name,
          part_number,
          quantity: String(quantity),
          price: formatWithThousands(parseFloat(price).toFixed(2))
        });
      } catch (err) {
        console.error('Error cargando parte:', err);
        alert('No se pudo cargar la parte');
      }
    };

    fetchPart();
  }, [partId]);

  const formatWithThousands = (value: string | number): string => {
    const numeric = String(value).replace(/[^\d]/g, '');
    if (!numeric) return '';
    const intPart = numeric.slice(0, -2).replace(/^0+/, '') || '0';
    const decimalPart = numeric.slice(-2).padStart(2, '0');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${withCommas}.${decimalPart}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'price') {
      const numeric = value.replace(/[^\d]/g, '').slice(0, 11);
      const padded = numeric.padStart(3, '0');
      setForm({ ...form, [field]: formatWithThousands(padded) });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.part_name.trim() ||
      !form.part_number.trim() ||
      !form.quantity.trim() ||
      !form.price.trim()
    ) {
      alert('Completa todos los campos requeridos.');
      return;
    }

    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      alert('Cantidad inválida.');
      return;
    }

    if (isNaN(parseFloat(form.price.replace(/[$,]/g, ''))) || parseFloat(form.price.replace(/[$,]/g, '')) <= 0) {
      alert('Precio inválido.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const quantityValue = parseInt(form.quantity, 10);
      const cleanForm = {
        part_name: form.part_name,
        part_number: form.part_number,
        quantity: form.quantity,
        price: form.price.replace(/[$,]/g, ''),
        available: quantityValue > 0 ? '1' : '0'
      };

      await axios.put(`${apiUrl}/parts/parts/update/${partId}`, cleanForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('¡Parte actualizada correctamente!');
      navigate('/parts');
    } catch (err) {
      console.error('Error actualizando parte:', err);
      alert('Error al actualizar la parte.');
    }
  };

  return (
    <ComponentCard title="Actualizar Parte Mecánica">
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
          <Label>PRODUCTO</Label>
          <Input
            value={form.part_name}
            onChange={(e) => handleChange('part_name', e.target.value)}
            placeholder="Nombre de la parte"
          />
        </div>

        <div>
          <Label>CÓDIGO</Label>
          <Input
            value={form.part_number}
            onChange={(e) => handleChange('part_number', e.target.value)}
            placeholder="Código único"
          />
        </div>

        <div>
          <Label>CANTIDAD</Label>
          <Input
            value={form.quantity}
            onChange={(e) => handleChange('quantity', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Ej: 100"
            inputMode="numeric"
          />
        </div>

        <div>
          <Label>PRECIO</Label>
          <Input
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="$"
            inputMode="numeric"
          />
        </div>

        <Button variant="primary" size="md" className="w-full">
          Actualizar Parte
        </Button>
      </form>
    </ComponentCard>
  );
}
