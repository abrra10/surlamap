"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getUserRole } from "@/lib/getProfile";
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const supabase = createClient(); // Move outside component
  const router = useRouter();
  const [selectKey, setSelectKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log("getUser result:", data, error);
        if (isMounted) {
          setUser(data.user);
          if (data.user) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("id", data.user.id)
              .single();
            console.log("profile result:", profile, profileError);
            setRole(profile?.role || null);
            setFullName(profile?.full_name || null);
          } else {
            setRole(null);
            setFullName(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("checkUser error:", err);
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .single();
          console.log("profile result (auth change):", profile, profileError);
          setRole(profile?.role || null);
          setFullName(profile?.full_name || null);
        } else {
          setRole(null);
          setFullName(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log("Logging out from navbar...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
        return;
      }

      console.log("Logout successful, redirecting to login...");
      router.push("/login");
      router.refresh(); // Force a refresh to clear any cached state
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An unexpected error occurred during logout.");
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
        <Select
          key={selectKey}
          onValueChange={(value) => {
            if (value === "dashboard") {
              if (role === "organizer") router.push("/dashboard/organizer");
              else if (role === "attendee") router.push("/dashboard/attendee");
              else router.push("/dashboard");
            } else if (value === "logout") {
              handleLogout();
            }
            // Reset the select by changing the key
            setSelectKey((k) => k + 1);
          }}
        >
          <SelectTrigger className="bg-white text-[#201e36] font-semibold rounded-xl px-4 py-2 w-36">
            <SelectValue placeholder={fullName || "Account"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">Go to Dashboard</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/login" className="text-gray-600 font-medium hover:underline">
        Log in
      </Link>
      <Link href="/signup">
        <Button className="bg-[#9fa8f7] text-white font-semibold rounded-xl px-6 py-2 hover:bg-[#8c98e8]">
          Sign up
        </Button>
      </Link>
    </div>
  );
};

export default AuthButtons;
