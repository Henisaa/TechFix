import axios from "axios";
import toast from "react-hot-toast";

export const userApi = axios.create({
  baseURL:
    import.meta.env.VITE_USER_SERVICE || "http://localhost:8080/api/v1/users",
});

export const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_SERVICE || "http://localhost:8081/pago",
});

export const inventoryApi = axios.create({
  baseURL: import.meta.env.VITE_INVENTARIO_SERVICE || "http://localhost:8082",
});

export const scheduleApi = axios.create({
  baseURL: import.meta.env.VITE_AGENDAR_SERVICE || "http://localhost:8083",
});

export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDENES_SERVICE || "http://localhost:8084",
});

const setupInterceptors = (apiClient) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        toast.error(
          "Servicio temporalmente no disponible — por favor intenta más tarde"
        );
      } else if (error.response.status === 404) {
        toast.error("Recurso no encontrado");
      } else if (error.response.status === 409) {
        toast.error(error.response.data || "Conflicto en el servidor");
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(userApi);
setupInterceptors(paymentApi);
setupInterceptors(inventoryApi);
setupInterceptors(scheduleApi);
setupInterceptors(orderApi);
