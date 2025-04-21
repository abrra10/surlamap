"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const AuthButtons = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white">{user.email}</span>
        <button
          onClick={handleLogout}
          className="h-12 rounded-lg bg-red-600 text-white font-bold px-5 hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/login">
        <button className="h-12 rounded-lg bg-white font-bold px-5 hover:bg-gray-100">
          Login
        </button>
      </Link>
      <Link href="/signup">
        <button className="h-12 rounded-lg bg-emerald-600 text-white font-bold px-5 hover:bg-emerald-700">
          Sign Up
        </button>
      </Link>
    </div>
  );
};

export default AuthButtons;
