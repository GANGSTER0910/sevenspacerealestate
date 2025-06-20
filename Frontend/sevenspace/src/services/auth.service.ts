import { fetchApi } from './api';
const url = process.env.url || 'http://localhost:8000';

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
  otp?: number;
}

export interface DecodedToken {
  email: string;
  role: string;
}

export interface PasswordResetData {
  email: string;
  password_reset: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Login attempt with:', { email, password: '***' });
      const loginResponse = await fetch(`${url}/auth_service/user/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', loginResponse.status);
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.error('Login error response:', errorData);
        throw new Error(errorData?.detail || 'Login failed');
      }

      const data = await loginResponse.json();
      console.log('Login successful response:', { message: data.message, role: data.role });
      return {
        message: data.message,
        role: data.role
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData: any) {
    return fetchApi('/auth_service/user', {
      method: 'POST',
      body: userData
    });
  },

  async logout() {
    // Clear the cookie by setting it to expire
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  async checkAuth(): Promise<AuthResponse> {
    const response = await fetch(`${url}/auth_service/checkAuthentication`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Authentication check failed');
    }

    return data;
  },

  async sendOTP(data: OTPData): Promise<AuthResponse> {
    return fetchApi('/auth_service/generate-otp', {
      method: 'POST',
      body: data
    });
  },

  async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
    return fetchApi('/auth_service/verifyotp', {
      method: 'POST',
      body: data
    });
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${import.meta.env.VITE_API_URL}/google/login`;
  },

  async decodeToken(): Promise<DecodedToken> {
    return fetchApi('/auth_service/decode', {
      method: 'POST',
      credentials: 'include'
    });
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    return fetchApi(`/auth_service/request-password-reset?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  async verifyResetOTP(email: string, otp: number): Promise<AuthResponse> {
    return fetchApi(`/auth_service/verifyotp?email=${encodeURIComponent(email)}&otp=${otp}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  async resetPassword(email: string, password_reset: string): Promise<AuthResponse> {
    return fetchApi('/auth_service/user/password-reset', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email,
        password: password_reset,
        password_reset: password_reset
      }
    });
  },
}; 