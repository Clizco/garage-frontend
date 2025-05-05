
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
  address_nickname: string;
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
        const storedToken = localStorage.getItem("decodedToken");
        if (storedToken) {
          const parsedToken = JSON.parse(storedToken);
          parsedToken.user_address = addressId;
          localStorage.setItem("decodedToken", JSON.stringify(parsedToken));
        }
        setSuccessAlert(true);
        setTimeout(() => setSuccessAlert(false), 2500);
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

      {/* Tabla para escritorio */}
      <div className="hidden md:block max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Nombre</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Alias</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Teléfono</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Detalles</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Provincia</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-gray-500 font-medium text-sm dark:text-gray-400">Acción</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {addresses.map((address) => (
              <TableRow key={address.id} className={address.id === selectedAddressId ? "bg-green-50 dark:bg-green-900/20" : ""}>
                <TableCell className="px-5 py-3 text-start text-gray-700 dark:text-white font-medium">{address.address_person_fullname}</TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-600 dark:text-gray-300">{address.address_nickname}</TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-600 dark:text-gray-300">{address.address_phonenumber}</TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-600 dark:text-gray-300">{address.address_details}</TableCell>
                <TableCell className="px-5 py-3 text-start text-gray-600 dark:text-gray-300">{provinces.find((prov) => prov.id === address.address_province)?.province_name || "Desconocida"}</TableCell>
                <TableCell className="px-5 py-3 text-start">
                  <Button size="sm" variant={address.id === selectedAddressId ? "primary" : "outline"} onClick={() => handleSelectAddress(address.id)}>
                    {address.id === selectedAddressId ? "Usando" : "Usar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards para móvil */}
      <div className="block md:hidden p-4 space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className={`rounded-xl border p-4 text-sm shadow-sm ${address.id === selectedAddressId ? 'border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/5'}`}>
            <p className="text-gray-800 dark:text-white"><strong>Nombre:</strong> {address.address_person_fullname}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Alias:</strong> {address.address_nickname}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Teléfono:</strong> {address.address_phonenumber}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Detalles:</strong> {address.address_details}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Provincia:</strong> {provinces.find((prov) => prov.id === address.address_province)?.province_name || "Desconocida"}</p>
            <div className="mt-3">
              <Button size="sm" variant={address.id === selectedAddressId ? "primary" : "outline"} onClick={() => handleSelectAddress(address.id)}>
                {address.id === selectedAddressId ? "Usando" : "Usar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
