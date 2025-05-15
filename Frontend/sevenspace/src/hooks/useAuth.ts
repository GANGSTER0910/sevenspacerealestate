import { useMutation, useQuery } from '@tanstack/react-query';
import { authService, LoginCredentials, RegisterData } from '@/services/auth.service';

export const useAuth = () => {
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
    },
  });

  const register = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
    },
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      localStorage.removeItem('token');
    },
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!localStorage.getItem('token'),
  });

  return {
    login,
    register,
    logout,
    user,
    isLoadingUser,
    isAuthenticated: !!user,
  };
}; 