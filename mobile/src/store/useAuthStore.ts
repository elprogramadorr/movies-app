import { create } from 'zustand';

type User = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
};

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  setUser: (user) => set({ user }),
}));
