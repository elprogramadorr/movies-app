// Ejemplo 
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define el tipo del estado
type AuthState = {
  user: { name: string; email: string } | null;
  isAuthenticated: boolean;
  login: (userData: { name: string; email: string }) => void;
  logout: () => void;
};

// Crea el store con tipado
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Clave para AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Persistencia
    }
  )
);