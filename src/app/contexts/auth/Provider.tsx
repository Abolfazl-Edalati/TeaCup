// Import Dependencies
import { useEffect, useReducer, ReactNode } from "react";

// Local Imports
import axios from "@/utils/axios";
import { isTokenValid, setSession, getCookie } from "@/utils/jwt";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

// ----------------------------------------------------------------------

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT";
  payload?: Partial<AuthContextType>;
}

// Initial state
const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  login: async () => {},
  initiateAuth: async () => ({ status: "" }),
  logout: async () => {},
};

// Reducer handlers
const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload?.isAuthenticated ?? false,
    isInitialized: true,
    user: action.payload?.user ?? null,
  }),
  LOGIN_REQUEST: (state) => ({ ...state, isLoading: true, errorMessage: null }),
  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload?.user ?? null,
  }),
  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),
  LOGOUT: (state) => ({ ...state, isAuthenticated: false, user: null }),
};

// Reducer function
const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = getCookie("authToken");
        if (authToken && isTokenValid(authToken)) {
          setSession(authToken);
          // تلاش برای گرفتن اطلاعات واقعی کاربر
          const response = await axios.get("/v1/auth/me");
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: true, user: response.data.user },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        setSession(null);
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };
    init();
  }, []);

  const initiateAuth = async (phone: string) => {
    try {
      const response = await axios.post("/v1/auth/initiate", {
        phoneNumber: phone,
      });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "خطا در ارسال کد";
      dispatch({ type: "LOGIN_ERROR", payload: { errorMessage: message } });
      console.log(phone);
      throw new Error(message);
    }
  };

  const login = async (credentials: {
    twoFactorCode: string;
    rememberMe: boolean;
  }) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      // ارسال کد تایید و وضعیت یادآوری بدون شماره موبایل
      const response = await axios.post("/v1/auth/login", credentials);
      console.log("پاسخ موفقیت‌آمیز سرور:", response.data);

      const { authToken, user } = response.data;
      setSession(authToken);
      dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
    } catch (err: any) {
      console.error("جزئیات خطای سرور:", err.response?.data);
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err.response?.data?.message || "کد وارد شده صحیح نیست",
        },
      });
      throw err;
    }
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  if (!children) return null;

  return (
    <AuthContext value={{ ...state, login, initiateAuth, logout }}>
      {children}
    </AuthContext>
  );
}
