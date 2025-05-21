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

export interface LoginResponse {
  message: string;
  role: string;
}

export interface AuthResponse {
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return fetchApi('/user/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  async register(userData: any) {
    return fetchApi('/user', {
      method: 'POST',
      body: userData
    });
  },

  async logout() {
    // Clear the cookie by setting it to expire
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  async checkAuth(): Promise<AuthResponse> {
    return fetchApi('/checkAuthentication', {
      method: 'POST'
    });
  },

  async sendOTP(data: OTPData): Promise<AuthResponse> {
    return fetchApi('/generate-otp', {
      method: 'POST',
      body: data
    });
  },

  async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
    return fetchApi('/verifyotp', {
      method: 'POST',
      body: data
    });
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_API_URL}/google/login`;
  },
}; 