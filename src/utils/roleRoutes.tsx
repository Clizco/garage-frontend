
import { Outlet, Navigate } from "react-router-dom";
import { getRole } from "./common"; // tu common.tsx

export function GuardiaRoutes() {
  return getRole() === "guard" ? <Outlet /> : <Navigate to="/" />;
}

export function ConductorRoutes() {
  return getRole() === "driver" ? <Outlet /> : <Navigate to="/" />;
}
