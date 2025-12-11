import axios from "axios";
import useTokenStore from "@/store";

const api = axios.create({
  // todo: move this value to env variable.
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (data: { email: string; password: string }) => {
  return api.post("/api/users/login", data);
};

export const register = async (data: { name: string; email: string; password: string; }) => {
  return api.post("/api/users/register", data);
};

export const getBooks = async () => {
  return api.get("/api/books");
};

export const getSingleBook = async (id: string) => {
  return api.get(`/api/books/${id}`);
};

export const createBook = async (data: FormData) => {
  return api.post("/api/books", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const editBook = async (id: string, data: FormData) => {
  return api.patch(`/api/books/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteBook = async (id: string) => {
  return api.delete(`/api/books/${id}`);
}