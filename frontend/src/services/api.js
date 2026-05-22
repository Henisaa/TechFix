import axios from "axios";
import toast from "react-hot-toast";


const GATEWAY = import.meta.env.VITE_GATEWAY_URL || "";



export const userApi = axios.create({
  baseURL: `${GATEWAY}/gateway/users`,
});

export const paymentApi = axios.create({
  baseURL: `${GATEWAY}/gateway/pagos`,
});

export const inventoryApi = axios.create({
  baseURL: `${GATEWAY}/gateway/stock`,
});

export const scheduleApi = axios.create({
  baseURL: `${GATEWAY}/gateway/citas`,
});

export const clientesApi = axios.create({
  baseURL: `${GATEWAY}/gateway/clientes`,
});

export const tecnicosApi = axios.create({
  baseURL: `${GATEWAY}/gateway/tecnicos`,
});



const injectToken = (config) => {
  try {
    const stored = localStorage.getItem("techfix_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers["Authorization"] = "Bearer " + parsed.token;
      }
    }
  } catch (_) {
  }
  return config;
};


const handleResponseError = (error) => {
  if (!error.response) {
    toast.error("Servicio temporalmente no disponible — intenta más tarde");
  } else {
    const status = error.response.status;
    const msg = error.response.data?.message || error.response.data?.error;

    if (status === 401) {
      toast.error("Sesión expirada — inicia sesión nuevamente");
      localStorage.removeItem("techfix_user");
      window.location.href = "/login";
    } else if (status === 403) {
      toast.error(msg || "No tienes permisos para esta acción");
    } else if (status === 404) {
      toast.error("Recurso no encontrado");
    } else if (status === 409) {
      toast.error(msg || "Conflicto en el servidor");
    } else if (status === 400) {
      toast.error("Datos inválidos — revisa el formulario");
    }
  }
  return Promise.reject(error);
};


const setupApi = (apiClient) => {
  apiClient.interceptors.request.use(injectToken);
  apiClient.interceptors.response.use((res) => res, handleResponseError);
};

[userApi, paymentApi, inventoryApi, scheduleApi, clientesApi, tecnicosApi].forEach(setupApi);
