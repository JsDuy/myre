"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string>; // Thêm hàm này
  logout: () => Promise<void>; // Thêm hàm logout nếu cần
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getIdToken: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm lấy token
  const getIdToken = useCallback(async () => {
    if (!user) {
      throw new Error("No user logged in");
    }
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw error;
    }
  }, [user]);

  // Hàm logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, getIdToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
