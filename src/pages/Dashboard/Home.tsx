import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getUser } from "../../utils/common";
import axios from "axios";
import { ClipboardCopy, Check } from "lucide-react";
import toast from "react-hot-toast";

const apiUrl = import.meta.env.VITE_API_URL || "";

interface CommonUser {
  id: number;
  user_firstname: string;
  user_lastname: string;
  user_email: string;
  user_phonenumber: string;
  user_province: string | number;
  user_prefix: string;
  user_address: string | number;
}

interface Address {
  id?: number;
  address_person_fullname: string;
  address_nickname: string;
  address_phonenumber: string;
  address_details: string;
  address_province: number;
  address_user: number;
}

export default function Home() {
  const [user, setUser] = useState<CommonUser | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentUser = getUser() as CommonUser | null;
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.user_address) {
        fetchAddress(currentUser.id, currentUser.user_address);
      }
    }
  }, []);

  const fetchAddress = async (userId: number, addressId: number | string) => {
    try {
      const response = await axios.get<Address[]>(
        `${apiUrl}/address/address/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const selected = response.data.find((addr) => addr.id === Number(addressId));
      if (selected) setAddress(selected);
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText("+1 (305) 592-4534");
      toast.success("Teléfono copiado 📋");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("No se pudo copiar 😢");
    }
  };

  return (
    <>
      <PageMeta
        title="Mi Perfil - Get."
        description="Esta es la página de inicio mostrando la información del usuario en PBE."
      />

      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          ¡Hola, {user ? `${user.user_firstname}` : "Usuario"}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Dirección del usuario */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
              Dirección
              <img
                src="https://flagcdn.com/w40/pa.png"
                alt="Panamá"
                className="w-6 h-4 rounded-sm"
              />
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-white/90">
              <div>
                <span className="font-semibold">Alias de la dirección: </span>
                <span>{address?.address_nickname || "No disponible"}</span>
              </div>
              <div>
                <span className="font-semibold">Nombre de la Persona: </span>
                <span>{address?.address_person_fullname || "No disponible"}</span>
              </div>
              <div>
                <span className="font-semibold">Teléfono de Contacto: </span>
                <span>{address?.address_phonenumber || "No disponible"}</span>
              </div>
              <div>
                <span className="font-semibold">Detalles de Dirección: </span>
                <span>{address?.address_details || "No disponible"}</span>
              </div>
            </div>
          </div>

          {/* Card: Casillero en Estados Unidos */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
              Dirección
              <img
                src="https://flagcdn.com/w40/us.png"
                alt="Estados Unidos"
                className="w-6 h-4 rounded-sm"
              />
            </h2>
            <div className="text-gray-600 dark:text-white/90 space-y-3">
              <div>
                <p className="font-semibold">Dirección:</p>
                <p>
                  {`${user?.user_prefix} ${user?.user_firstname || ""} ${user?.user_lastname || ""}`}<br />
                  7854 NW 46th St, Doral, FL 33166, USA
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Teléfono:</p>
                <button
                  onClick={copyPhone}
                  className="relative flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 group"
                  title="Copiar teléfono"
                >
                  {/* Mini alerta visual */}
                  {copied && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow transition-opacity duration-300 z-10">
                      ¡Teléfono copiado!
                    </span>
                  )}
                  <span className="group-hover:underline">+1 (305) 592-4534</span>
                  {copied ? <Check size={18} /> : <ClipboardCopy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
