"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "../login/actions";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import React from "react";
import { Toggle } from "../../components/ui/toggle";

const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm your password"),
    full_name: z.string().min(1, "Full name is required"),
    phone_number: z
      .string()
      .min(6, "Phone number is too short")
      .max(20, "Phone number is too long"),
    address: z.string().min(1, "Address is required"),
    role: z.enum(["attendee", "organizer"], {
      errorMap: () => ({ message: "Role is required" }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = async (data: SignUpForm) => {
    const form = new FormData();
    form.append("email", data.email);
    form.append("password", data.password);
    form.append("full_name", data.full_name);
    form.append("phone_number", data.phone_number);
    form.append("address", data.address);
    form.append("role", data.role);
    await signup(form);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto my-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold text-[#201e36]">
            Create an account
          </CardTitle>
          <CardDescription>
            Sign up to get started. Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 text-[#8395F9] hover:opacity-80"
            >
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="full_name" className="text-xs">
                Full Name
              </Label>
              <Input
                id="full_name"
                placeholder="Full Name"
                {...register("full_name")}
              />
              {errors.full_name && (
                <span className="text-red-500 text-xs mt-0.5">
                  {errors.full_name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="email" className="text-xs">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-0.5">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col gap-0.5 w-full">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                />
                {errors.password && (
                  <span className="text-red-500 text-xs mt-0.5">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <Label htmlFor="confirm_password" className="text-xs">
                  Confirm your password
                </Label>
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <span className="text-red-500 text-xs mt-0.5">
                    {errors.confirm_password.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1 ml-1">
              <input
                id="show_password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
                className="accent-[#bfc3f7] w-3 h-3 rounded border border-[#bfc3f7]"
              />
              <Label htmlFor="show_password" className="text-xs cursor-pointer">
                Show password
              </Label>
            </div>
            <div className="text-xs text-[#23223a] mb-1 ml-1">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col gap-0.5 w-full">
                <Label htmlFor="phone_number" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  placeholder="Phone Number"
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <span className="text-red-500 text-xs mt-0.5">
                    {errors.phone_number.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <Label htmlFor="address" className="text-xs">
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Address"
                  {...register("address")}
                />
                {errors.address && (
                  <span className="text-red-500 text-xs mt-0.5">
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs mb-1">Role</Label>
              <div className="flex gap-2 flex-wrap">
                <Toggle
                  type="button"
                  pressed={watch("role") === "organizer"}
                  onPressedChange={() => setValue("role", "organizer")}
                  className={`px-4 py-1 rounded-full border text-xs font-semibold transition-all ${
                    watch("role") === "organizer"
                      ? "bg-[#bfc3f7] text-[#201e36] border-[#bfc3f7]"
                      : "bg-white text-[#201e36] border-[#bfc3f7] hover:bg-[#f2fae6]"
                  }`}
                >
                  Organizer
                </Toggle>
                <Toggle
                  type="button"
                  pressed={watch("role") === "attendee"}
                  onPressedChange={() => setValue("role", "attendee")}
                  className={`px-4 py-1 rounded-full border text-xs font-semibold transition-all ${
                    watch("role") === "attendee"
                      ? "bg-[#bfc3f7] text-[#201e36] border-[#bfc3f7]"
                      : "bg-white text-[#201e36] border-[#bfc3f7] hover:bg-[#f2fae6]"
                  }`}
                >
                  Attendee
                </Toggle>
              </div>
              {errors.role && (
                <span className="text-red-500 text-xs mt-0.5">
                  {errors.role.message}
                </span>
              )}
            </div>
            <div className="w-full flex justify-center my-2">
              <div
                className="bg-[#f2fae6] border border-[#bfc3f7] rounded-md px-6 py-4 text-xs text-[#201e36] text-center select-none"
                style={{ minWidth: 220 }}
              >
                Captcha verification here
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] px-6 py-1.5 rounded-full text-sm"
            >
              Create an account
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 mt-2">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
