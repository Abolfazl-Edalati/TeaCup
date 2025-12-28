import { jwtDecode } from "jwt-decode";
import axios from "./axios";

const isTokenValid = (authToken: string): boolean => {
  try {
    const decoded: { exp?: number } = jwtDecode(authToken);
    if (!decoded.exp) {
      console.error("Token does not contain an expiration time.");
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return false;
  }
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const setSession = (authToken?: string | null): void => {
  if (typeof authToken === "string" && authToken.trim() !== "") {
    // ذخیره در کوکی برای ۷ روز
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `authToken=${authToken}; ${expires}; path=/; SameSite=Lax`;

    // تنظیم هدر برای درخواست‌های بعدی
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    // حذف کوکی و هدر
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    delete axios.defaults.headers.common.Authorization;
  }
};

export { isTokenValid, setSession, getCookie };
