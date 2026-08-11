import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("firebase_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("firebase_token");
      }
    }
    return Promise.reject(error);
  }
);

export const catalogApi = {
  categories: {
    list: () => api.get("/categories").then((r) => r.data),
    bySlug: (slug: string) => api.get(`/categories/${slug}`).then((r) => r.data),
  },
  products: {
    list: (params = {}) => api.get("/products", { params }).then((r) => r.data),
    byId: (id: string) => api.get(`/products/${id}`).then((r) => r.data),
    bySku: (sku: string) => api.get(`/products/sku/${sku}`).then((r) => r.data),
  },
};

export const orderApi = {
  create: (data: any) => api.post("/orders", data).then((r) => r.data),
  list: () => api.get("/orders").then((r) => r.data),
  byId: (id: string) => api.get(`/orders/${id}`).then((r) => r.data),
  myOrders: () => api.get("/orders/my").then((r) => r.data),
};

export const userApi = {
  me: () => api.get("/users/me").then((r) => r.data),
  create: (data: any) => api.post("/users", data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then((r) => r.data),
};

export const paymentApi = {
  byOrder: (orderId: string) => api.post(`/payments/order/${orderId}`).then((r) => r.data),
};

export default api;