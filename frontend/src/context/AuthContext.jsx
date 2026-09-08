import { createContext, useContext, useState, useEffect, useCallback } from "react";
import client from "../api/clients";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("talentis_token"));
  const [me, setMe] = useState(null); // { id, email, active_role, worker_profile, employer_profile }
  const [loading, setLoading] = useState(true);

  // Interroge /users/me avec un token EXPLICITE (pas celui du state React),
  // pour éviter tout problème de "closure périmée" juste après une connexion.
  const fetchMeWithToken = useCallback(async (tok) => {
    if (!tok) {
      setMe(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await client.get("/users/me", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setMe(data);
      return data;
    } catch (err) {
      setToken(null);
      localStorage.removeItem("talentis_token");
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rechargement au montage / si le token change ailleurs (ex: onglet dupliqué)
  useEffect(() => {
    fetchMeWithToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistSession(data) {
    localStorage.setItem("talentis_token", data.access_token);
    setToken(data.access_token);
    // On attend que `me` soit chargé AVANT de rendre la main à l'appelant
    // (Login, Register…) qui va faire un navigate() juste après.
    await fetchMeWithToken(data.access_token);
  }

  async function login(email, password) {
    const { data } = await client.post("/auth/login", { email, password });
    await persistSession(data);
    return data;
  }

  async function registerWorker(payload) {
    const { data } = await client.post("/auth/register/worker", payload);
    await persistSession(data);
    return data;
  }

  async function registerEmployer(payload) {
    const { data } = await client.post("/auth/register/employer", payload);
    await persistSession(data);
    return data;
  }

  async function switchRole() {
    const { data } = await client.post("/auth/switch-role");
    await persistSession(data);
    return data;
  }

  async function addWorkerProfile(payload) {
    const { data } = await client.post("/auth/add-worker-profile", payload);
    await persistSession(data);
    return data;
  }

  async function addEmployerProfile(payload) {
    const { data } = await client.post("/auth/add-employer-profile", payload);
    await persistSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("talentis_token");
    setToken(null);
    setMe(null);
  }

  const value = {
    token,
    me,
    loading,
    isAuthenticated: Boolean(token && me),
    activeRole: me?.active_role,
    hasWorkerProfile: Boolean(me?.worker_profile),
    hasEmployerProfile: Boolean(me?.employer_profile),
    login,
    registerWorker,
    registerEmployer,
    switchRole,
    addWorkerProfile,
    addEmployerProfile,
    logout,
    refresh: () => fetchMeWithToken(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}