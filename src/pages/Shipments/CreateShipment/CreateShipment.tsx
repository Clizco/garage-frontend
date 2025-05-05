import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComponentCard from '../../../components/common/ComponentCard';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Select from '../../../components/form/Select';

const apiUrl = import.meta.env.VITE_API_URL || '';
const provincesUrl = `${apiUrl}/provinces/provinces/all`;
const shipmentUrl = `${apiUrl}/shipments/shipments/create`;

interface Province {
  id: number;
  province_name: string;
}

interface User {
  id: number;
}

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [shipmentOrigin, setShipmentOrigin] = useState<number | null>(null);
  const [shipmentDestination, setShipmentDestination] = useState<number | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const user: User | null = JSON.parse(localStorage.getItem('decodedToken') || 'null');

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

  const generateShipmentCode = (provinceId: number): string => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `ENV-${provinceId}-${randomDigits}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shipmentOrigin || !shipmentDestination) {
      return alert('Por favor, selecciona una provincia válida');
    }

    const newShipmentCode = generateShipmentCode(shipmentDestination);

    try {
      const response = await axios.post(shipmentUrl, {
        shipment_date: new Date().toISOString(),
        shipment_status: 'Pendiente',
        shipment_origin: shipmentOrigin,
        shipment_destination: shipmentDestination,
        shipment_sender_name: senderName,
        shipment_sender_phonenumber: senderPhone,
        shipment_sender_email: senderEmail,
        shipment_receiver_name: receiverName,
        shipment_receiver_phonenumber: receiverPhone,
        shipment_description: contentDescription,
        shipment_code: newShipmentCode,
        shipment_user: user?.id,
        shipment_assigned_user: receiverEmail, // Se guarda aquí el correo del destinatario
      });

      console.log(response.data);
      alert('¡Gracias por enviar!');
    } catch (error: any) {
      console.error(error?.response || error);
      alert('Error al enviar el paquete. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <ComponentCard title="Formulario de Envío">
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

        {/* Origen */}
        <div>
          <Label>Origen</Label>
          <Select
            options={provinces.map(p => ({ label: p.province_name, value: p.id.toString() }))}
            placeholder="Selecciona una provincia"
            onChange={(value: string) => setShipmentOrigin(Number(value))}
          />
        </div>

        {/* Datos del Remitente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nombre del remitente</Label>
            <Input
              type="text"
              placeholder="Persona que envía"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div>
            <Label>Correo del remitente</Label>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">* Asegúrese de escribir correctamente el correo del remitente.</p>
          </div>
          <div>
            <Label>Teléfono del remitente</Label>
            <Input
              type="text"
              placeholder="Teléfono"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Descripción del contenido</Label>
            <Input
              type="text"
              placeholder="Contenido declarado"
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Destino */}
        <div className="mt-6">
          <Label>Destino</Label>
          <Select
            options={provinces.map(p => ({ label: p.province_name, value: p.id.toString() }))}
            placeholder="Selecciona una provincia"
            onChange={(value: string) => setShipmentDestination(Number(value))}
          />
        </div>

        {/* Datos del Destinatario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Nombre del destinatario</Label>
            <Input
              type="text"
              placeholder="Persona que recibe"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
            />
          </div>
          <div>
            <Label>Correo del destinatario</Label>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">* Asegúrese de escribir correctamente el correo del destinatario.</p>
          </div>
          <div>
            <Label>Teléfono del destinatario</Label>
            <Input
              type="text"
              placeholder="Teléfono"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Botón Enviar */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded w-full shadow hover:bg-blue-600"
        >
          Enviar
        </button>
      </form>
    </ComponentCard>
  );
};

export default CreateShipment;
