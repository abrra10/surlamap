"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "../login/actions";
import Link from "next/link";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z
    .string()
    .min(6, "Phone number is too short")
    .max(20, "Phone number is too long"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(["attendee", "organizer"], {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

type SignUpForm = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  });

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
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

        <input
          {...register("email")}
          placeholder="Email"
          className="w-full mb-1 px-3 py-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
        )}

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="w-full mb-1 px-3 py-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>
        )}

        <input
          {...register("full_name")}
          placeholder="Full Name"
          className="w-full mb-1 px-3 py-2 border rounded"
        />
        {errors.full_name && (
          <p className="text-red-500 text-sm mb-2">
            {errors.full_name.message}
          </p>
        )}

        <input
          {...register("phone_number")}
          placeholder="Phone Number"
          className="w-full mb-1 px-3 py-2 border rounded"
        />
        {errors.phone_number && (
          <p className="text-red-500 text-sm mb-2">
            {errors.phone_number.message}
          </p>
        )}

        <input
          {...register("address")}
          placeholder="Address"
          className="w-full mb-1 px-3 py-2 border rounded"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">{errors.address.message}</p>
        )}

        <select
          {...register("role")}
          className="w-full mb-2 px-3 py-2 border rounded"
        >
          <option value="">Select role</option>
          <option value="organizer">Organizer</option>
          <option value="attendee">Attendee</option>
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm mb-4">{errors.role.message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </main>
  );
}
