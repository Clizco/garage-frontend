// src/utils/notify.ts
import { toast } from "react-hot-toast";

/**
 * Muestra un toast de éxito ✅
 * @param message Mensaje que quieres mostrar
 */
export const notifySuccess = (message: string): void => {
  toast.success(message, {
    icon: "✅",
    style: {
      background: "#333",
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
    },
    position: "top-right",
  });
};

/**
 * Muestra un toast de error ❌
 * @param message Mensaje que quieres mostrar
 */
export const notifyError = (message: string): void => {
  toast.error(message, {
    icon: "❌",
    style: {
      background: "#333",
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
    },
    position: "top-right",
  });
};
