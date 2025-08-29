import OptimizedLogin from "@/app/components/auth/OptimizedLogin";
import ServerNavigation from "@/app/components/ServerNavigation";
import ServerFooter from "@/app/components/ServerFooter";

export default function LoginPage() {
  return (
    <>
      <ServerNavigation />
      <main className="flex items-center justify-center min-h-screen bg-[#f2fae6]">
        <OptimizedLogin />
      </main>
      <ServerFooter />
    </>
  );
}
