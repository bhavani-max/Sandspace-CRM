import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("crm_token"));

  useEffect(() => {
    const stored = localStorage.getItem("crm_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (authResponse) => {
    localStorage.setItem("crm_token", authResponse.token);
    localStorage.setItem("crm_user", JSON.stringify(authResponse));
    setToken(authResponse.token);
    setUser(authResponse);
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
