
export interface User {
  [key: string]: any; // Puedes reemplazar esto con una interfaz más específica si sabes la estructura del usuario
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('decodedToken');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
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

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("decodedToken");
  localStorage.removeItem("userRole"); 
};
