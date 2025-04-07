"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Login logic
export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Signup logic
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const full_name = formData.get("full_name") as string;
  const phone_number = formData.get("phone_number") as string;
  const address = formData.get("address") as string;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !authData.user) {
    console.error("Signup error:", signUpError);
    redirect("/error");
  }

  // Insert the user profile data (email, full_name, phone_number, address, role)
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id, // Link profile to auth user using their ID
    email,
    full_name,
    phone_number,
    address,
    role: role || "attendee", // Default to 'attendee' if no role is provided
  });

  if (profileError) {
    console.error("Profile insert error:", profileError);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Logout logic
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login"); // Redirect to login or any other page after logout
}
