import { apiFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type ForgotPasswordRequest = components["schemas"]["ForgotPasswordRequest"];
export type ResetPasswordRequest = components["schemas"]["ResetPasswordRequest"];
export type GoogleAuthRequest = components["schemas"]["GoogleAuthRequest"];
export type TokenPairResponse = components["schemas"]["TokenPairResponse"];
export type UserResponse = components["schemas"]["UserResponse"];
export type MeResponse = components["schemas"]["MeResponse"];

export function registerUser(body: RegisterRequest) {
  return apiFetch("/api/v1/auth/register", { method: "post", body });
}

export function login(body: LoginRequest) {
  return apiFetch("/api/v1/auth/login", { method: "post", body });
}

export function googleAuth(body: GoogleAuthRequest) {
  return apiFetch("/api/v1/auth/google", { method: "post", body });
}

export function verifyEmail(token: string) {
  return apiFetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}` as "/api/v1/auth/verify-email", {
    method: "get",
  });
}

export function forgotPassword(body: ForgotPasswordRequest) {
  return apiFetch("/api/v1/auth/forgot-password", { method: "post", body });
}

export function resetPassword(body: ResetPasswordRequest) {
  return apiFetch("/api/v1/auth/reset-password", { method: "post", body });
}

export function logoutRequest(refreshToken: string) {
  return apiFetch("/api/v1/auth/logout", {
    method: "post",
    body: { refresh_token: refreshToken },
  });
}

export function getMe() {
  return apiFetch("/api/v1/auth/me", { method: "get" });
}
