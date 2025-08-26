import { Suspense } from "react";
import { getRegisteredEventsAction } from "@/app/actions/profiles";
import { serverAuthOptimizations } from "@/lib/server-auth-optimizations";
import DashboardLayout from "@/app/components/dashboard/Layout";
import AttendeeDashboardClient from "./AttendeeDashboardClient";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { redirect } from "next/navigation";

// Force dynamic rendering for pages that use cookies
export const dynamic = "force-dynamic";

// Revalidate dashboard data every 2 minutes
export const revalidate = 120;

// Loading component for dashboard
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 h-96 bg-gray-200 animate-pulse rounded-lg" />
        <div className="col-span-3 h-96 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

// Main dashboard component
export default async function AttendeeDashboard() {
  try {
    // Get user and verify attendee role
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      redirect("/login");
    }

    const profile = await serverAuthOptimizations.getOptimizedProfile(user.id);
    if (!profile) {
      redirect("/error");
    }

    // Fetch registered events
    const eventsResult = await getRegisteredEventsAction();

    if (eventsResult.error) {
      console.error("Dashboard data error:", eventsResult.error);
      throw new Error("Failed to load dashboard data");
    }

    // Validate data
    if (!eventsResult.data) {
      throw new Error("Invalid dashboard data received");
    }

    return (
      <DashboardLayout role="attendee" user={profile}>
        <div className="space-y-6">
          <Suspense fallback={<DashboardLoading />}>
            <ErrorBoundary>
              <AttendeeDashboardClient
                user={profile}
                registeredEvents={eventsResult.data}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    redirect("/error");
  }
}
