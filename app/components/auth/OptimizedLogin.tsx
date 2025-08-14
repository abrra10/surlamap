"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  optimizedAuth,
  authErrorHandler,
  authPerformance,
} from "../../../lib/auth-optimizations";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function OptimizedLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange", // Real-time validation
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  // Pre-validate form before submission
  const isFormValid = useCallback(() => {
    if (!watchedEmail || !watchedPassword) return false;

    const emailValid = optimizedAuth.validateEmail(watchedEmail);
    const passwordValid = optimizedAuth.validatePassword(watchedPassword).valid;

    return emailValid && passwordValid;
  }, [watchedEmail, watchedPassword]);

  const onSubmit = async (data: LoginForm) => {
    // Prevent rapid submissions
    if (loading) return;

    // Rate limiting
    if (loginAttempts >= 5) {
      setError("Too many login attempts. Please wait a moment and try again.");
      return;
    }

    const trackOperation = authPerformance.trackAuthOperation("login");

    try {
      setLoading(true);
      setError(null);
      setLoginAttempts((prev) => prev + 1);

      // Use optimized login with debouncing
      const result = await optimizedAuth.debouncedLogin(
        data.email,
        data.password
      );

      trackOperation();

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      trackOperation();

      // Handle specific errors
      const errorMessage = authErrorHandler.getErrorMessage(err);
      setError(errorMessage);

      // Clear password field on error
      const passwordInput = document.getElementById(
        "password"
      ) as HTMLInputElement;
      if (passwordInput) {
        passwordInput.value = "";
      }

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear error when user starts typing
  const handleInputChange = useCallback(() => {
    if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold text-[#201e36]">
            Welcome back
          </CardTitle>
          <CardDescription>Sign in to your Surlamap account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                onChange={(e) => {
                  register("email").onChange(e);
                  handleInputChange();
                }}
                className={errors.email ? "border-red-500" : ""}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                onChange={(e) => {
                  register("password").onChange(e);
                  handleInputChange();
                }}
                className={errors.password ? "border-red-500" : ""}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isFormValid() || loginAttempts >= 5}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Rate Limiting Notice */}
            {loginAttempts >= 3 && (
              <p className="text-xs text-orange-600 text-center">
                Multiple failed attempts detected. Please check your
                credentials.
              </p>
            )}

            {/* Links */}
            <div className="text-center space-y-2">
              <Link
                href="/signup"
                className="text-sm text-[#8395F9] hover:underline"
              >
                Don't have an account? Sign up
              </Link>
              <br />
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() =>
                  setError("Password reset functionality coming soon!")
                }
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="text-muted-foreground text-center text-xs">
        By signing in, you agree to our{" "}
        <Link href="#" className="underline hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
