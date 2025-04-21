import { User } from './common'; // Asegúrate de ajustar la ruta si usas el tipo

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('decodedToken');
  if (userStr) return JSON.parse(userStr) as User;
  return null;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token') || null;
};

export const getRole = (): string | null => {
  const role = localStorage.getItem('userRole');
  return role ? role : null;
};

export const removeUserSession = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setUserSession = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
