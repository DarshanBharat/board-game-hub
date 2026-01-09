import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  roomNo?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { 
    name: string; 
    email: string; 
    phone: string; 
    roomNo: string; 
    password: string;
    secretQuestion: string;
    secretAnswer: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ secretQuestion: string }>;
  verifyAnswer: (email: string, answer: string) => Promise<{ success: boolean }>;
  resetPassword: (data: any) => Promise<{ success: boolean }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      email: string; 
      phone: string; 
      roomNo: string; 
      password: string;
      secretQuestion: string;
      secretAnswer: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    roomNo: string; 
    password: string;
    secretQuestion: string;
    secretAnswer: string;
  }) => {
    await signupMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const forgotPassword = async (email: string) => {
    const res = await apiRequest("POST", "/api/auth/forgot-password", { email });
    return res.json();
  };

  const verifyAnswer = async (email: string, answer: string) => {
    const res = await apiRequest("POST", "/api/auth/verify-answer", { email, answer });
    return res.json();
  };

  const resetPassword = async (data: any) => {
    const res = await apiRequest("POST", "/api/auth/reset-password", data);
    return res.json();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        verifyAnswer,
        resetPassword,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
