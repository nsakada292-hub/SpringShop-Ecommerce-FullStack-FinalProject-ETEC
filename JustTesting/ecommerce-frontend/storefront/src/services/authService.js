import api from "./api";
import { readSession, writeSession, removeSession } from "../utils/localStore";

const EMAIL_KEY = "pending_email";

export const pendingEmail = {
  read: () => readSession(EMAIL_KEY, ""),
  set: (email) => writeSession(EMAIL_KEY, email || ""),
  clear: () => removeSession(EMAIL_KEY),
};

// Auth contract (Spring Boot AuthController):
//   register   POST /auth/register {name,email,password}  → {message}
//   login      POST /auth/login     {email,password}      → {message} (OTP sent)
//   sendOtp    POST /auth/send-otp  {email}               → {message}
//   verifyOtp  POST /auth/verify-otp {email, otpCode}     → AuthResponse
//   refresh    POST /auth/refresh    {refreshToken}       → RefreshTokenResponse
//   logout     POST /auth/logout     {refreshToken}       → {message}
export const register = (data) => api.post("/auth/register", data);

export const login = (data) => api.post("/auth/login", data);

export const sendOtp = (email) => api.post("/auth/send-otp", { email });

export const verifyOtp = (data) => api.post("/auth/verify-otp", data);

export const refresh = (refreshToken) => api.post("/auth/refresh", { refreshToken });

export const logout = (refreshToken) => api.post("/auth/logout", { refreshToken });

// "Forgot password" reuses send-otp (the backend emails a verification
// code); reset-password is wired to the documented spec endpoint and
// falls back gracefully when the server does not implement it yet.
export const forgotPassword = (email) => api.post("/auth/send-otp", { email });

export const resetPassword = (data) => api.post("/auth/reset-password", data);

export const getProfile = () => api.get("/users/me");

// Build the handoff URL for the separate admin app (its own origin).
export function adminRedirectUrl(auth) {
  const base = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";
  const params = new URLSearchParams({
    token: auth?.token || "",
    refreshToken: auth?.refreshToken || "",
    name: auth?.user?.name || "",
    email: auth?.user?.email || "",
    role: auth?.user?.role || "",
  });
  return `${base}/login-success?${params.toString()}`;
}