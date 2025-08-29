"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "../utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  role: string | null;
  full_name: string | null;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user profile data
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, email")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }

      // Clear local state
      setUser(null);
      setProfile(null);

      // Clear storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Hard redirect
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initial auth check
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error && error.message !== "Auth session missing!") {
          console.error("Auth check error:", error);
        }

        if (isMounted) {
          setUser(currentUser);

          if (currentUser) {
            const profileData = await fetchProfile(currentUser.id);
            setProfile(profileData);
          }

          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Initial auth check error:", error);
          setLoading(false);
        }
      }
    };

    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
