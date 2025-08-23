"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Toggle } from "../../../components/ui/toggle";
import {
  optimizedAuth,
  authErrorHandler,
  authPerformance,
} from "../../../lib/auth-optimizations";

const SignUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Please confirm your password"),
    full_name: z.string().min(1, "Full name is required"),
    phone_number: z
      .string()
      .min(6, "Phone number is too short")
      .max(20, "Phone number is too long"),
    address: z.string().min(1, "Address is required"),
    role: z.enum(["attendee", "organizer"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

export default function OptimizedSignup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupAttempts, setSignupAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
    mode: "onChange", // Real-time validation
    defaultValues: {
      role: "organizer",
    },
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const watchedRole = watch("role");

  // Pre-validate form before submission
  const isFormValid = useCallback(() => {
    if (!watchedEmail || !watchedPassword || !watchedRole) return false;

    const emailValid = optimizedAuth.validateEmail(watchedEmail);
    const passwordValid = optimizedAuth.validatePassword(watchedPassword).valid;

    return emailValid && passwordValid;
  }, [watchedEmail, watchedPassword, watchedRole]);

  const onSubmit = async (data: SignUpForm) => {
    // Prevent rapid submissions
    if (loading) return;

    // Rate limiting
    if (signupAttempts >= 3) {
      setError("Too many signup attempts. Please wait a moment and try again.");
      return;
    }

    const trackOperation = authPerformance.trackAuthOperation("signup");

    try {
      setLoading(true);
      setError(null);
      setSignupAttempts((prev) => prev + 1);

      // Use optimized signup
      await optimizedAuth.optimizedSignup({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address,
        role: data.role,
      });

      trackOperation();

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      trackOperation();

      // Handle specific errors
      const errorMessage = authErrorHandler.getErrorMessage(err);
      setError(errorMessage);

      console.error("Signup error:", err);
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
    <div className="flex flex-col gap-6 w-full max-w-xl py-6 mx-auto">
      <Card className="bg-[#201e36] rounded-4xl overflow-hidden shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-fugaz italic font-extrabold text-[#bfc3f7]">
            Create an account
          </CardTitle>
          <CardDescription className="font-montserrat uppercase text-sm font-semibold text-[#bfc3f7]">
            <div>Sign up to get started</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Full Name */}
            <div className="space-y-3">
              <Label htmlFor="full_name" className="text-[#bfc3f7] font-medium">
                Full Name
              </Label>
              <Input
                id="full_name"
                placeholder="Full Name"
                {...register("full_name")}
                onChange={(e) => {
                  register("full_name").onChange(e);
                  handleInputChange();
                }}
                className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                  errors.full_name ? "border-red-500" : ""
                }`}
                autoComplete="name"
                autoFocus
              />
              {errors.full_name && (
                <span className="text-red-500 text-xs">
                  {errors.full_name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#bfc3f7] font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                {...register("email")}
                onChange={(e) => {
                  register("email").onChange(e);
                  handleInputChange();
                }}
                className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                  errors.email ? "border-red-500" : ""
                }`}
                autoComplete="email"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-[#bfc3f7] font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    handleInputChange();
                  }}
                  className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="confirm_password"
                  className="text-[#bfc3f7] font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  {...register("confirm_password")}
                  onChange={(e) => {
                    register("confirm_password").onChange(e);
                    handleInputChange();
                  }}
                  className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                    errors.confirm_password ? "border-red-500" : ""
                  }`}
                  autoComplete="new-password"
                />
                {errors.confirm_password && (
                  <span className="text-red-500 text-xs">
                    {errors.confirm_password.message}
                  </span>
                )}
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center gap-2">
              <input
                id="show_password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
                className="accent-[#bfc3f7] w-3 h-3 rounded border border-[#bfc3f7]"
              />
              <Label
                htmlFor="show_password"
                className="text-xs cursor-pointer text-[#bfc3f7]"
              >
                Show password
              </Label>
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-[#bfc3f7]">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phone_number"
                  className="font-medium text-[#bfc3f7]"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  placeholder="Phone Number"
                  {...register("phone_number")}
                  onChange={(e) => {
                    register("phone_number").onChange(e);
                    handleInputChange();
                  }}
                  className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                    errors.phone_number ? "border-red-500" : ""
                  }`}
                  autoComplete="tel"
                />
                {errors.phone_number && (
                  <span className="text-red-500 text-xs">
                    {errors.phone_number.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-medium text-[#bfc3f7]">
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Address"
                  {...register("address")}
                  onChange={(e) => {
                    register("address").onChange(e);
                    handleInputChange();
                  }}
                  className={`rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white ${
                    errors.address ? "border-red-500" : ""
                  }`}
                  autoComplete="street-address"
                />
                {errors.address && (
                  <span className="text-red-500 text-xs">
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="font-medium text-[#bfc3f7]">
                Choose your role
              </Label>
              <div className="bg-white rounded-full p-1 flex">
                <button
                  type="button"
                  onClick={() => setValue("role", "organizer")}
                  className={`flex-1 py-2 px-4 text-sm font-semibold transition-all rounded-full ${
                    watchedRole === "organizer"
                      ? "bg-[#bfc3f7] text-[#201e36] "
                      : "text-[#201e36] hover:bg-gray-50"
                  }`}
                >
                  Organizer
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "attendee")}
                  className={`flex-1 py-2 px-4 text-sm font-semibold transition-all rounded-full ${
                    watchedRole === "attendee"
                      ? "bg-[#bfc3f7] text-[#201e36] "
                      : "text-[#201e36] hover:bg-gray-50"
                  }`}
                >
                  Attendee
                </button>
              </div>
              {errors.role && (
                <span className="text-red-500 text-xs">
                  {errors.role.message}
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
              disabled={loading || !isFormValid() || signupAttempts >= 3}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </Button>

            {/* Rate Limiting Notice */}
            {signupAttempts >= 2 && (
              <p className="text-xs text-orange-600 text-center">
                Multiple signup attempts detected. Please check your
                information.
              </p>
            )}
          </form>
          <div className="text-center text-md text-[#bfc3f7] mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 text-[#bfc3f7] hover:text-white"
            >
              Log in
            </Link>
          </div>
        </CardContent>
        {/* Terms */}
        <div className="text-[#bfc3f7] text-center text-xs">
          By creating an account, you agree to our{" "}
          <Link href="#" className="underline hover:text-[#bfc3f7]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-[#bfc3f7]">
            Privacy Policy
          </Link>
          .
        </div>
      </Card>
    </div>
  );
}
