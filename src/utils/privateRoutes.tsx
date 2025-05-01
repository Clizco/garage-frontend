// src/utils/PrivateRoutes.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./common";

const PrivateRoutes = () => {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoutes;
