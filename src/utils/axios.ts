import axios from "axios";
import { JWT_HOST_API } from "@/configs/auth";

const axiosInstance = axios.create({
  baseURL: "https://dev.xperia.top",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// اینترسپتورها برای هندل کردن توکن
axiosInstance.interceptors.request.use(
  (config) => {
    // توکن را از کوکی می‌خواند و در هدر می‌گذارد (اگر ست نشده باشد)
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
