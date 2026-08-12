import { createContext, useEffect, useMemo, useState } from "react";

import { getProfileRequest, loginRequest, signupRequest } from "../services/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("vault_token"));
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!token) {
        if (isMounted) {
          setAuthReady(true);
        }

        return;
      }

      try {
        const response = await getProfileRequest();

        if (isMounted) {
          setUser(response.data.data);
        }
      } catch {
        localStorage.removeItem("vault_token");

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    restoreSession();

    const handleUnauthorized = () => {
      if (isMounted) {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener("vault_unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("vault_unauthorized", handleUnauthorized);
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    const authData = response.data.data;

    localStorage.setItem("vault_token", authData.token);
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    const authData = response.data.data;

    localStorage.setItem("vault_token", authData.token);
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const logout = () => {
    localStorage.removeItem("vault_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      authReady,
      login,
      signup,
      logout,
    }),
    [user, token, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };