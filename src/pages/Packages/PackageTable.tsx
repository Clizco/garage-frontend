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
import Button from '../../components/ui/button/Button';

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

const apiUrl = import.meta.env.VITE_API_URL || '';
const shipmentsUrl = `${apiUrl}/shipments/shipments/all`;

// 👉 Formatear fecha a dd/mm/yyyy
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function PackageTable() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<Shipment[]>(shipmentsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShipments(response.data);
      } catch (error) {
        console.error('Error fetching shipment data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = (shipmentId: number) => {
    console.log(`Eliminar paquete con ID: ${shipmentId}`);
    // axios.delete(`${apiUrl}/shipments/shipments/${shipmentId}`).then(...)
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Código</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Fecha</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Estado</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Origen</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Destino</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Remitente</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Descripción</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Acción</TableCell>
            </TableRow>
          </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                 {shipments.map((shipment) => (
            <TableRow key={shipment.id}>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                {shipment.shipment_code}
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                {formatDate(shipment.shipment_date)}
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                <Badge
                size="sm"
                color={
                    shipment.shipment_status === 'Active'
                    ? 'success'
                    : shipment.shipment_status === 'Pending'
                    ? 'warning'
                    : 'error'
                }
                >
                {shipment.shipment_status}
                </Badge>
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                {shipment.shipment_origin}
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                {shipment.shipment_destination}
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-white/90">
                {shipment.shipment_sender_name}
                </span>
            </TableCell>
            <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                {shipment.shipment_description}
            </TableCell>
            <TableCell className="px-5 py-3 text-start">
                <Button size="sm" variant="primary" onClick={() => handleDelete(shipment.id)}>
                Eliminar
                </Button>
            </TableCell>
            </TableRow>
        ))}
        </TableBody>

        </Table>
      </div>
    </div>
  );
}
