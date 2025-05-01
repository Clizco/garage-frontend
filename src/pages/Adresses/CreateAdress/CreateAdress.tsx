import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Select from '../../../components/form/Select';
import Textarea from '../../../components/form/input/TextArea';
import Button from "../../../components/ui/button/Button";

const apiUrl = import.meta.env.VITE_API_URL || '';
const provincesUrl = `${apiUrl}/provinces/provinces/all`;
const addressesUrl = `${apiUrl}/address/address/create`;

interface Province {
  id: number;
  province_name: string;
}

const CreateAddress: React.FC = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [addressName, setAddressName] = useState('');
  const [addressAlias, setAddressAlias] = useState('');
  const [addressProvince, setAddressProvince] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('decodedToken') || 'null');
    if (storedUser?.id) {
      setUserId(storedUser.id);
    } else {
      console.error('No se encontró el ID del usuario en el token.');
    }
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>(provincesUrl);
        setProvinces(response.data);
      } catch (error) {
        console.error('Error obteniendo las provincias:', error);
      }
    };
    fetchProvinces();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) return alert('No se encontró el usuario. Inicia sesión nuevamente.');
    if (!addressAlias || !addressName || !addressProvince || !addressDetails || !phoneNumber) {
      return alert('Todos los campos son obligatorios.');
    }
    if (phoneNumber.length !== 8) {
      return alert('El número de teléfono debe tener exactamente 8 dígitos.');
    }

    try {
      const response = await axios.post(addressesUrl, {
        address_person_fullname: addressName,
        address_nickname: addressAlias,
        address_phonenumber: phoneNumber,
        address_details: addressDetails,
        address_province: parseInt(addressProvince),
        address_user: userId,
      });

      console.log(response.data);
      alert('¡Dirección añadida con éxito!');
      navigate('/addresses');
    } catch (error: any) {
      console.error('Error al registrar la dirección:', error.response || error);
      alert('Error al registrar la dirección. Inténtalo de nuevo.');
    }
  };

  return (
    <ComponentCard title="Nueva Dirección">
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
          <Label>Alias de la Dirección</Label>
          <Input
            type="text"
            placeholder="Ej: Casa Principal, Oficina, etc."
            value={addressAlias}
            onChange={(e) => setAddressAlias(e.target.value)}
          />
        </div>

        <div>
          <Label>Nombre Completo</Label>
          <Input
            type="text"
            placeholder="Nombre completo"
            value={addressName}
            onChange={(e) => setAddressName(e.target.value)}
          />
        </div>

        <div>
          <Label>Provincia</Label>
          <Select
            options={provinces.map(p => ({ label: p.province_name, value: p.id.toString() }))}
            placeholder="Seleccione una provincia"
            onChange={setAddressProvince}
          />
        </div>

        <div>
          <Label>Detalles de la dirección</Label>
          <Textarea
            placeholder="Escribe aquí los detalles..."
            value={addressDetails}
            onChange={(value: string) => setAddressDetails(value)}
          />
        </div>

        <div>
          <Label>Número de Teléfono</Label>
          <Input
            type="text"
            placeholder="Ej: 60000000"
            value={phoneNumber}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              setPhoneNumber(onlyNums.slice(0, 8));
            }}
          />
        </div>

        <Button variant="primary" className="w-full">
          Añadir dirección
        </Button>
      </form>
    </ComponentCard>
  );
};

export default CreateAddress;
