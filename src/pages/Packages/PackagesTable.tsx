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
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/badge/Badge';

interface Package {
  id: number;
  package_weight: string;
  package_description: string;
  package_value: string;
  package_store: string;
  package_status: string;
  created_at: string;
  updated_at: string;
  invoice_path?: string;
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

export default function PackageTable() {
  const [packages, setPackages] = useState<Package[]>([]);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('decodedToken') || '{}');
      const userId = user.id;

      const response = await axios.get<Package[]>(
        `${apiUrl}/packages/packages/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching package data:', error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreate = () => {
    navigate('/create-package');
  };

  const handleDownloadInvoice = (invoicePath: string) => {
    const fullUrl = `${apiUrl}${invoicePath}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Botón para prealertar paquete */}
      <div className="flex justify-end p-4">
        <Button size="sm" variant="primary" onClick={handleCreate}>
          Prealertar Paquete
        </Button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Creado</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Peso</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Descripción</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Valor</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Tienda</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Estado</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Factura</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(pkg.created_at)}
                </TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {pkg.package_weight}
                </TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {pkg.package_description}
                </TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {`$${parseFloat(pkg.package_value).toFixed(2)}`}
                </TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {pkg.package_store}
                </TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      pkg.package_status === 'Active'
                        ? 'success'
                        : pkg.package_status === 'Pending'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {pkg.package_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-start">
                  {pkg.invoice_path ? (
                    <Button size="sm" variant="outline" onClick={() => pkg.invoice_path && handleDownloadInvoice(pkg.invoice_path)}>
                      Descargar
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-theme-xs">Sin factura</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
