
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';

interface Shipment {
  id: number;
  shipment_code: string;
  shipment_date: string;
  shipment_status: string;
  shipment_origin: string;
  shipment_destination: string;
  shipment_sender_name: string;
  shipment_description: string;
}

interface Province {
  id: number;
  province_name: string;
}

const apiUrl = import.meta.env.VITE_API_URL || '';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function ShipmentReceived() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [provinces, setProvinces] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await axios.get<Province[]>(`${apiUrl}/provinces/provinces/all`);
        const map: Record<number, string> = {};
        data.forEach((p) => {
          map[p.id] = p.province_name;
        });
        setProvinces(map);
      } catch (err) {
        console.error('Error fetching provinces:', err);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('decodedToken') || '{}');
        const userId = user?.id;

        if (!token || !userId) {
          console.error('Token o usuario no encontrado.');
          return;
        }

        const url = `${apiUrl}/shipments/shipments/received/${userId}`;
        const response = await axios.get<Shipment[]>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setShipments(response.data);
      } catch (err) {
        console.error('Error fetching received shipments:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setFade(true), 50);
      }
    };

    setFade(false);
    fetchShipments();
  }, []);

  const getProvinceName = (provinceId: string) => {
    const id = Number(provinceId);
    return provinces[id] || 'Desconocido';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Desktop */}
      <div className={`hidden md:block max-w-full overflow-x-auto p-4 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-white/70 p-8">Cargando envíos recibidos...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-white/70 p-8">No tienes envíos recibidos aún.</div>
        ) : (
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader>Código</TableCell>
                <TableCell isHeader>Fecha</TableCell>
                <TableCell isHeader>Estado</TableCell>
                <TableCell isHeader>Origen</TableCell>
                <TableCell isHeader>Destino</TableCell>
                <TableCell isHeader>Remitente</TableCell>
                <TableCell isHeader>Descripción</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.shipment_code}</TableCell>
                  <TableCell>{formatDate(s.shipment_date)}</TableCell>
                  <TableCell>
                    <Badge size="sm" color={s.shipment_status === 'Active' ? 'success' : s.shipment_status === 'Pending' ? 'warning' : 'error'}>
                      {s.shipment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getProvinceName(s.shipment_origin)}</TableCell>
                  <TableCell>{getProvinceName(s.shipment_destination)}</TableCell>
                  <TableCell className="font-medium">{s.shipment_sender_name}</TableCell>
                  <TableCell>{s.shipment_description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Mobile */}
      <div className={`block md:hidden p-4 space-y-4 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-white/70">Cargando envíos recibidos...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-white/70">No tienes envíos recibidos aún.</div>
        ) : (
          shipments.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 text-sm bg-white dark:bg-white/5 border-gray-200 dark:border-white/[0.05]">
              <p className="text-gray-700 dark:text-gray-200"><strong>Código:</strong> {s.shipment_code}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Fecha:</strong> {formatDate(s.shipment_date)}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Estado:</strong> <Badge size="sm" color={s.shipment_status === 'Active' ? 'success' : s.shipment_status === 'Pending' ? 'warning' : 'error'}>{s.shipment_status}</Badge></p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Origen:</strong> {getProvinceName(s.shipment_origin)}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Destino:</strong> {getProvinceName(s.shipment_destination)}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Remitente:</strong> {s.shipment_sender_name}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Descripción:</strong> {s.shipment_description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
