import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getUser, getRole } from "../../utils/common";

interface CommonUser {
  id: number;
  user_firstname: string;
  user_lastname: string;
}

export default function Home() {
  const [user, setUser] = useState<CommonUser | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const currentUser = getUser() as CommonUser | null;
    if (currentUser) {
      setUser(currentUser);
    }

    const currentRole = getRole();
    setRole(currentRole ?? "");

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <PageMeta
        title="Inicio - Sistema de Seguridad"
        description="Vista principal personalizada por rol"
      />

      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          ¡Bienvenido, {user ? user.user_firstname : "Usuario"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString()}
        </p>

        {role === "guard" && (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
              Panel de acceso del personal de seguridad
            </h2>
            <p className="text-lg text-gray-700 dark:text-white">
              Desde aquí puedes controlar las entradas y salidas de vehículos, revisar inspecciones recientes y mantener el control de acceso en la garita.
            </p>
          </div>
        )}

        {role === "driver" && (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
              Panel del conductor
            </h2>
            <p className="text-lg text-gray-700 dark:text-white">
              Aquí puedes ver tus rutas asignadas, verificar tus registros y revisar el historial de tus viajes.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
