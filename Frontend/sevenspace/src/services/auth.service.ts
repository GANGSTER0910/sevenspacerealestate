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

export interface DecodedToken {
  email: string;
  role: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // First, attempt to login
      const loginResponse = await fetchApi('/auth_service/user/login', {
        method: 'POST',
        body: { email, password }
      });

      // Then check authentication
      const authResponse = await this.checkAuth();
      
      if (authResponse.message === "Authenticated") {
        // If authenticated, decode the token to get user role
        const decodedToken = await this.decodeToken();
        console.log('Decoded token:', decodedToken); // Debug log
        return {
          message: loginResponse.message,
          role: decodedToken.role
        };
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Login error:', error); // Debug log
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
    return fetchApi('/auth_service/checkAuthentication', {
      method: 'POST'
    });
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
}; 