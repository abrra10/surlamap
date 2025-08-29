import OptimizedSignup from "@/app/components/auth/OptimizedSignup";
import ServerNavigation from "@/app/components/ServerNavigation";
import ServerFooter from "@/app/components/ServerFooter";

export default function SignUpPage() {
  return (
    <>
      <ServerNavigation />
      <main className="flex items-center justify-center min-h-screen bg-[#f2fae6]">
        <OptimizedSignup />
      </main>
      <ServerFooter />
    </>
  );
}
