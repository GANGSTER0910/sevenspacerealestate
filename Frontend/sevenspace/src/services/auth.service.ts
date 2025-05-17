import { fetchApi } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
  phone?: number;
}

export interface OTPData {
  email: string;
}

export interface OTPVerifyData {
  email: string;
  otp: number;
}

export interface AuthResponse {
  message: string;
  role?: string;
  email?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return fetchApi('/user/login', {
      method: 'POST',
      body: credentials,
      credentials: 'include', // Important for cookies
    });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return fetchApi('/user', {
      method: 'POST',
      body: data,
      credentials: 'include', // Important for cookies
    });
  },

  async logout(): Promise<void> {
    // The backend handles session expiration through cookies
    // Just clear any local state if needed
  },

  async checkAuth(): Promise<AuthResponse> {
    return fetchApi('/checkAuthentication', {
      method: 'POST',
      credentials: 'include', // Important for cookies
    });
  },

  async sendOTP(data: OTPData): Promise<AuthResponse> {
    return fetchApi('/generate-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
    return fetchApi('/verifyotp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_API_URL}/google/login`;
  },
}; 