import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import Button from '../../components/ui/button/Button';

interface Driver {
  id: number;
  driver_name: string;
  driver_phonenumber: string;
  driver_email: string;
  driver_province: number;
  created_at: string;
}

interface Province {
  id: number;
  province_name: string;
}

const apiUrl = import.meta.env.VITE_API_URL || '';
const driversUrl = `${apiUrl}/drivers/drivers/all`;
const provincesUrl = `${apiUrl}/provinces/provinces/all`;

export default function DriverTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, provincesRes] = await Promise.all([
          axios.get<Driver[]>(driversUrl),
          axios.get<Province[]>(provincesUrl),
        ]);
        setDrivers(driversRes.data);
        setProvinces(provincesRes.data);
      } catch (error) {
        console.error('Error fetching drivers or provinces:', error);
      }
    };

    fetchData();
  }, []);

  const getProvinceName = (id: number) => {
    return provinces.find((p) => p.id === id)?.province_name || 'Desconocido';
  };

  const handleDelete = (driverId: number) => {
    console.log(`Eliminar conductor con ID: ${driverId}`);
    // Aquí puedes hacer una petición DELETE si deseas eliminar en el backend
    // axios.delete(`${apiUrl}/drivers/${driverId}`).then(...)
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Nombre
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Teléfono
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Provincia
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Fecha de registro
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Acción
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="px-4 py-3 text-start text-gray-800 font-medium text-theme-sm dark:text-white/90">
                  {driver.driver_name}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {driver.driver_phonenumber}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {driver.driver_email}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {getProvinceName(driver.driver_province)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(driver.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Button size="sm" variant="primary" onClick={() => handleDelete(driver.id)}>
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
