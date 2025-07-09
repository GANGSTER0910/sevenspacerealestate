// import { fetchApi } from './api';
// const url = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/auth_service';

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   role?: string;
//   phone?: number;
// }

// export interface OTPData {
//   email: string;
// }

// export interface OTPVerifyData {
//   email: string;
//   otp: number;
// }

// export interface LoginResponse {
//   message: string;
//   role: string;
// }

// export interface AuthResponse {
//   message: string;
//   otp?: number;
// }

// export interface DecodedToken {
//   email: string;
//   role: string;
// }

// export interface PasswordResetData {
//   email: string;
//   password_reset: string;
// }

// export const authService = {
//   async login(email: string, password: string): Promise<LoginResponse> {
//     try {
//       console.log('Login attempt with:', { email, password: '***' });
//       const loginResponse = await fetch(`${url}/user/login`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password })
//       });

//       console.log('Login response status:', loginResponse.status);
      
//       if (!loginResponse.ok) {
//         const errorData = await loginResponse.json();
//         console.error('Login error response:', errorData);
//         throw new Error(errorData?.detail || 'Login failed');
//       }

//       const data = await loginResponse.json();
//       console.log('Login successful response:', { message: data.message, role: data.role });
//       return {
//         message: data.message,
//         role: data.role
//       };

//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   },

//   async register(userData: any) {
//     return fetchApi('/user', {
//       method: 'POST',
//       body: userData
//     });
//   },

//   async logout() {
//     // Clear the cookie by setting it to expire
//     document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//   },

//   async checkAuth(): Promise<AuthResponse> {
//     const response = await fetch(`${url}/checkAuthentication`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.detail || 'Authentication check failed');
//     }

//     return data;
//   },

//   async sendOTP(data: OTPData): Promise<AuthResponse> {
//     return fetchApi('/generate-otp', {
//       method: 'POST',
//       body: data
//     });
//   },

//   async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
//     return fetchApi('/verifyotp', {
//       method: 'POST',
//       body: data
//     });
//   },

//   async googleLogin(): Promise<void> {
//     window.location.href = `${import.meta.env.VITE_API_URL}/google/login`;
//   },

//   async decodeToken(): Promise<DecodedToken> {
//     return fetchApi('/decode', {
//       method: 'POST',
//       credentials: 'include'
//     });
//   },

//   async requestPasswordReset(email: string): Promise<AuthResponse> {
//     return fetchApi(`/request-password-reset?email=${encodeURIComponent(email)}`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });
//   },

//   async verifyResetOTP(email: string, otp: number): Promise<AuthResponse> {
//     return fetchApi(`/verifyotp?email=${encodeURIComponent(email)}&otp=${otp}`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });
//   },

//   async resetPassword(email: string, password_reset: string): Promise<AuthResponse> {
//     return fetchApi('/user/password-reset', {
//       method: 'PUT',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: {
//         email,
//         password: password_reset,
//         password_reset: password_reset
//       }
//     });
//   },

//   async googleCheckAuth(): Promise<AuthResponse> {
//     const response = await fetch(`${url}/google/checkauthentication`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.detail || 'Authentication check failed');
//     }

//     return data;
//   },
// }; 
import { fetchApi } from './api';

const url = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/auth_service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleTokenRequest {
  credential: string; // Google ID token - NEW
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
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
  };
}

export interface AuthResponse {
  message: string;
  otp?: number;
}

export interface DecodedToken {
  email: string;
  role: string;
  name?: string;
  picture?: string;
}

export interface PasswordResetData {
  email: string;
  password_reset: string;
}

export const authService = {
  // Original JWT login - PRESERVED
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Login attempt with:', { email, password: '***' });
      const loginResponse = await fetch(`${url}/user/login`, {
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
        role: data.role,
        user: data.user
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Google OAuth with ID Token - NEW ADDITION
  async googleTokenLogin(credential: string): Promise<LoginResponse> {
    try {
      console.log('Google token login attempt...');
      const response = await fetch(`${url}/auth/google/token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential })
      });

      console.log('Google login response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google login error response:', errorData);
        throw new Error(errorData?.detail || 'Google login failed');
      }

      const data = await response.json();
      console.log('Google login successful response:', data);
      
      return {
        message: data.message,
        role: data.user?.role || 'user',
        user: data.user
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Server-side redirect approach - NEW ADDITION
  async googleLogin(): Promise<void> {
    window.location.href = `${url}/auth/google/login`;
  },

  // All other existing methods - PRESERVED
  async register(userData: any) {
    return fetchApi('/user', {
      method: 'POST',
      body: userData
    });
  },

  async logout() {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  async checkAuth(): Promise<AuthResponse> {
    const response = await fetch(`${url}/checkAuthentication`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Authentication check failed');
    }

    return data;
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

  async decodeToken(): Promise<DecodedToken> {
    return fetchApi('/decode', {
      method: 'POST',
      credentials: 'include'
    });
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    return fetchApi(`/request-password-reset?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async verifyResetOTP(email: string, otp: number): Promise<AuthResponse> {
    return fetchApi(`/verifyotp?email=${encodeURIComponent(email)}&otp=${otp}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async resetPassword(email: string, password_reset: string): Promise<AuthResponse> {
    return fetchApi('/user/password-reset', {
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

  async googleCheckAuth(): Promise<AuthResponse> {
    const response = await fetch(`${url}/google/checkauthentication`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Authentication check failed');
    }

    return data;
  },
};
