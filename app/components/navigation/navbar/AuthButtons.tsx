"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
  const supabase = createClient();
  const router = useRouter();
  // Always call useRef at the top level
  const selectRef = useRef<any>(null);
  const [selectKey, setSelectKey] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", data.user.id)
            .single();
          setRole(profile?.role || null);
          setFullName(profile?.full_name || null);
        } else {
          setRole(null);
          setFullName(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role || null);
        setFullName(profile?.full_name || null);
      } else {
        setRole(null);
        setFullName(null);
      }
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
