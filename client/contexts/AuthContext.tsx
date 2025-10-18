import { createContext, useContext, type ReactNode } from "react";
import { getCurrentUser, type User } from "@/data/users";

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentUser = getCurrentUser();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
