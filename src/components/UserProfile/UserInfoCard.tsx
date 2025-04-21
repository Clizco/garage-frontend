import { useEffect, useState } from "react";

interface CommonUser {
  id: number;
  user_firstname: string;
  user_lastname: string;
  user_email: string;
  user_phonenumber: string;
  user_province: string | number;
  user_address: string | number;
}
import { useNavigate } from "react-router-dom";
import { useModal } from "../../hooks/useModal";
import { getUser  } from "../../utils/common";
import axios from "axios";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";

interface Province {
  id: number;
  province_name: string;
}

interface Address {
  id: number;
  address_name: string;
}



const apiUrl = import.meta.env.VITE_API_URL || "";
const provincesUrl = `${apiUrl}/provinces/provinces/all`;
const addressesUrl = `${apiUrl}/address/address/all`;

export default function UserInfoCard() {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  const [user, setUser] = useState<CommonUser | null>(() => getUser() as CommonUser | null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | number>(user?.user_province || "");
  const [selectedAddress, setSelectedAddress] = useState<string | number>(user?.user_address || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provRes, addrRes] = await Promise.all([
          axios.get<Province[]>(provincesUrl),
          axios.get<Address[]>(addressesUrl),
        ]);
        setProvinces(provRes.data);
        setAddresses(addrRes.data);
      } catch (error) {
        console.error("Error loading data", error);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      const updateUrl = `${apiUrl}/users/users/update/${user.id}`;
      await axios.post(updateUrl, {
        ...user,
        user_province: selectedProvince,
        user_address: selectedAddress,
      });
      alert("Información actualizada con éxito");
      closeModal();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error al actualizar la información");
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="text-xs text-gray-500">First Name</p>
              <p className="text-sm text-gray-800 dark:text-white/90">{user?.user_firstname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Name</p>
              <p className="text-sm text-gray-800 dark:text-white/90">{user?.user_lastname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-800 dark:text-white/90">{user?.user_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-800 dark:text-white/90">{user?.user_phonenumber}</p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="bg-white p-6 rounded-3xl dark:bg-gray-900">
          <h4 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white/90">Edit Personal Information</h4>
          <form className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input
                value={user?.user_firstname || ""}
                onChange={(e) => setUser(user ? { ...user, user_firstname: e.target.value } : null)}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={user?.user_lastname || ""}
                onChange={(e) => setUser(user ? { ...user, user_lastname: e.target.value } : null)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <div className="w-full border rounded p-2 bg-gray-100 text-gray-600">
                {user?.user_email || ""}
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={user?.user_phonenumber || ""}
                onChange={(e) => setUser(user ? { ...user, user_phonenumber: e.target.value } : null)}
              />
            </div>
            <div>
              <Label>Provincia</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Seleccionar provincia</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.province_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Dirección</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                <option value="">Seleccionar dirección</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.address_name}</option>
                ))}
              </select>
            </div>
          </form>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={closeModal}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Guardar Cambios</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
