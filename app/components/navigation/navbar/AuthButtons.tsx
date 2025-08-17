"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import { useState } from "react";

const AuthButtons = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [selectKey, setSelectKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
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
              if (profile?.role === "organizer") {
                router.push("/dashboard/organizer");
              } else if (profile?.role === "attendee") {
                router.push("/dashboard/attendee");
              } else {
                router.push("/dashboard");
              }
            } else if (value === "logout") {
              handleLogout();
            }
            // Reset the select by changing the key
            setSelectKey((k) => k + 1);
          }}
        >
          <SelectTrigger className="bg-white text-[#201e36] font-semibold rounded-xl px-4 py-2 w-36">
            <SelectValue placeholder={profile?.full_name || "Account"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">Go to Dashboard</SelectItem>
            <SelectItem value="logout" disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </SelectItem>
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
