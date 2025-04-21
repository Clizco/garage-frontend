import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import Button from '../../components/ui/button/Button'; // Asegúrate de tener este componente

interface User {
  id: number;
  user_image: string;
  user_firstname: string;
  user_lastname: string;
  role_id: string;
  user_province: number;
  user_phonenumber: string;
  created_at: string;
  user_unique_id: string;
}

interface Province {
  id: number;
  province_name: string;
}

const apiUrl = import.meta.env.VITE_API_URL || '';
const usersUrl = `${apiUrl}/users/users/all`;
const provincesUrl = `${apiUrl}/provinces/provinces/all`;

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, provincesRes] = await Promise.all([
          axios.get<User[]>(usersUrl),
          axios.get<Province[]>(provincesUrl),
        ]);
        setUsers(usersRes.data);
        setProvinces(provincesRes.data);
      } catch (error) {
        console.error('Error fetching user or province data:', error);
      }
    };

    fetchData();
  }, []);

  const getProvinceName = (id: number) => {
    return provinces.find((p) => p.id === id)?.province_name || 'Desconocido';
  };

  const handleDelete = (userId: number) => {
    console.log(`Eliminar usuario con ID: ${userId}`);
    // Aquí puedes hacer una petición DELETE a tu backend si lo necesitas
    // axios.delete(`${apiUrl}/users/${userId}`).then(...)
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
            <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                    ID unico
            </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Usuario
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Rol
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Provincia
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Teléfono
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Creado
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">
                Acción
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {user.user_unique_id}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {user.user_firstname} {user.user_lastname}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {user.id}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {getProvinceName(user.user_province)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {user.user_phonenumber}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Button size="sm" variant="primary" onClick={() => handleDelete(user.id)}>
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
