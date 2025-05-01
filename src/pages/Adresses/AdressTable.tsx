import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";


interface Address {
  id: number;
  address_person_fullname: string;
  address_nickname: string; // ✅ Nuevo campo
  address_phonenumber: string;
  address_details: string;
  address_province: number;
}

interface Province {
  id: number;
  province_name: string;
}

const apiUrl = import.meta.env.VITE_API_URL || "";

export default function AddressBook() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("decodedToken") || "{}");
    if (storedUser?.id) {
      setUserId(storedUser.id);
      setSelectedAddressId(storedUser.user_address || null);
    } else {
      console.error("No se encontró el ID del usuario en el token.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAddresses();
      fetchProvinces();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${apiUrl}/address/address/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${apiUrl}/provinces/provinces/all`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleSelectAddress = async (addressId: number) => {
    try {
      const response = await fetch(`${apiUrl}/users/update/address/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user_address: addressId }),
      });

      if (response.ok) {
        setSelectedAddressId(addressId);

        // 🔁 Actualiza el decodedToken en localStorage
        const storedToken = localStorage.getItem("decodedToken");
        if (storedToken) {
          const parsedToken = JSON.parse(storedToken);
          parsedToken.user_address = addressId;
          localStorage.setItem("decodedToken", JSON.stringify(parsedToken));
        }

        // ✅ Mostrar alerta de éxito
        setSuccessAlert(true);
        setTimeout(() => setSuccessAlert(false), 2500);
      } else {
        console.error("Error actualizando dirección del usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <Button size="sm" variant="primary" onClick={() => navigate("/createaddress")}>
          Agregar Dirección
        </Button>
      </div>

      {successAlert && (
        <div className="mx-4 mb-4 rounded bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-300">
          ✅ Dirección cambiada exitosamente.
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Nombre</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Alias</TableCell> {/* ✅ Nuevo header */}
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Teléfono</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Detalles</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Provincia</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-theme-xs dark:text-gray-400">Acción</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <TableRow
                  key={address.id}
                  className={address.id === selectedAddressId ? "bg-green-50 dark:bg-green-900/20" : ""}
                >
                  <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-white/90 font-medium">
                    {address.address_person_fullname}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {address.address_nickname} {/* ✅ Nuevo dato */}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {address.address_phonenumber}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {address.address_details}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {provinces.find((prov) => prov.id === address.address_province)?.province_name || "Desconocida"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-start">
                    <Button
                      size="sm"
                      variant={address.id === selectedAddressId ? "primary" : "outline"}
                      onClick={() => handleSelectAddress(address.id)}
                    >
                      {address.id === selectedAddressId ? "Usando" : "Usar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={6} className="px-5 py-3 text-center text-sm text-gray-500 dark:text-white/70">
                  No tienes direcciones guardadas. <span className="text-blue-600 dark:text-blue-400">¡Crea una ahora!</span>
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
