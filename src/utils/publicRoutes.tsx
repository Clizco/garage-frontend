import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes: React.FC = () => {
  const user = localStorage.getItem('decodedToken');
  const parsedUser = user ? JSON.parse(user) : null;

  return parsedUser ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicRoutes;
