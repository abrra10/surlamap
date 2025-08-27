"use client";

import { createClient } from "@/utils/supabase/client";

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Optimized login with debouncing
export const debouncedLogin = debounce(async (email: string, password: string) => {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
}, 300);

// Optimized signup
export const optimizedSignup = async (userData: {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
}) => {
  const supabase = createClient();
  
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });
  
  if (authError) {
    throw authError;
  }
  
  if (!authData.user) {
    throw new Error("Failed to create user");
  }
  
  // Then create the profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      full_name: userData.full_name,
      phone_number: userData.phone_number,
      address: userData.address,
      role: userData.role,
      email: userData.email,
    });
  
  if (profileError) {
    // If profile creation fails, we should clean up the auth user
    // But Supabase doesn't allow deleting users from client side
    throw profileError;
  }
  
  return authData;
};

// Auth error handler
export const authErrorHandler = {
  getErrorMessage: (error: any): string => {
    if (typeof error === "string") {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error_description) {
      return error.error_description;
    }
    
    return "An unexpected error occurred";
  }
};

// Auth performance tracking
export const authPerformance = {
  trackAuthOperation: (operation: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      console.log(`Auth operation '${operation}' took ${duration.toFixed(2)}ms`);
    };
  }
};

// Optimized auth object
export const optimizedAuth = {
  validateEmail,
  validatePassword,
  debouncedLogin,
  optimizedSignup,
};
