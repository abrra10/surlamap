import dynamic from "next/dynamic";
import React, { Suspense, lazy, ComponentType } from "react";

// Loading components for different use cases
const DefaultLoading = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const CardLoading = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-lg p-6">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

const TableLoading = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
    ))}
  </div>
);

const ChartLoading = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// Lazy loading wrapper with performance tracking
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
    componentName?: string;
  } = {}
) {
  const {
    loading = DefaultLoading,
    ssr = true,
    componentName = "LazyComponent",
  } = options;

  return dynamic(importFunc, {
    loading: loading
      ? (props: any) => React.createElement(loading, props)
      : undefined,
    ssr,
  });
}

// Predefined lazy components for common use cases
export const LazyEventCard = createLazyComponent(
  () => import("@/app/events/EventCard"),
  { loading: CardLoading, componentName: "EventCard" }
);

export const LazyDashboard = createLazyComponent(
  () => import("@/app/dashboard/page"),
  { loading: DefaultLoading, componentName: "Dashboard" }
);

export const LazyOrganizerDashboard = createLazyComponent(
  () => import("@/app/dashboard/organizer/OrganizerDashboardClient"),
  { loading: DefaultLoading, componentName: "OrganizerDashboard" }
);

export const LazyAttendeeDashboard = createLazyComponent(
  () => import("@/app/dashboard/attendee/AttendeeDashboardClient"),
  { loading: DefaultLoading, componentName: "AttendeeDashboard" }
);

export const LazyCreateEventForm = createLazyComponent(
  () => import("@/app/components/events/CreateEventForm"),
  { loading: DefaultLoading, componentName: "CreateEventForm" }
);

export const LazyEventsSlider = createLazyComponent(
  () => import("@/app/components/events/EventsSlider"),
  { loading: CardLoading, componentName: "EventsSlider" }
);

export const LazyCategorySlider = createLazyComponent(
  () => import("@/app/components/events/CategorySlider"),
  { loading: DefaultLoading, componentName: "CategorySlider" }
);

// Lazy loading for heavy UI components
export const LazyCalendar = createLazyComponent(
  () =>
    import("@/components/ui/calendar").then((module) => ({
      default: module.Calendar,
    })),
  { loading: DefaultLoading, componentName: "Calendar" }
);

export const LazyDatePicker = createLazyComponent(
  () =>
    import("@/components/ui/date-picker").then((module) => ({
      default: module.DatePicker,
    })),
  { loading: DefaultLoading, componentName: "DatePicker" }
);

export const LazySwiper = createLazyComponent(
  () => import("swiper/react").then((module) => ({ default: module.Swiper })),
  {
    loading: DefaultLoading,
    ssr: false,
    componentName: "Swiper",
  }
);

// Lazy loading for authentication components
export const LazyLoginForm = createLazyComponent(
  () => import("@/app/components/auth/OptimizedLogin"),
  { loading: DefaultLoading, componentName: "LoginForm" }
);

export const LazySignupForm = createLazyComponent(
  () => import("@/app/components/auth/OptimizedSignup"),
  { loading: DefaultLoading, componentName: "SignupForm" }
);

// Lazy loading for navigation components
export const LazySidebar = createLazyComponent(
  () => import("@/app/components/navigation/sidebar"),
  { loading: DefaultLoading, componentName: "Sidebar" }
);

export const LazyNavbar = createLazyComponent(
  () => import("@/app/components/navigation/navbar"),
  { loading: DefaultLoading, componentName: "Navbar" }
);

// Utility for conditional lazy loading
export function conditionalLazyLoad<T extends ComponentType<any>>(
  condition: boolean,
  importFunc: () => Promise<{ default: T }>,
  fallback: T,
  options: { loading?: ComponentType; componentName?: string } = {}
): T {
  if (condition) {
    return createLazyComponent(importFunc, options) as T;
  }
  return fallback;
}

// Preload utility for critical components
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return () => {
    importFunc();
  };
}

// Preload critical components
export const preloadDashboard = preloadComponent(
  () => import("@/app/dashboard/page")
);
export const preloadEvents = preloadComponent(
  () => import("@/app/events/page")
);
export const preloadAuth = preloadComponent(
  () => import("@/app/components/auth/OptimizedLogin")
);

// Lazy loading wrapper with error boundary
export function withLazyErrorBoundary<T extends ComponentType<any>>(
  Component: T,
  fallback?: ComponentType
) {
  return function LazyErrorBoundaryWrapper(props: any) {
    return (
      <Suspense
        fallback={fallback ? React.createElement(fallback) : <DefaultLoading />}
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// Bundle size analyzer utility
export function analyzeBundleSize() {
  if (typeof window !== "undefined") {
    const performance = window.performance;
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      const bundleSize = navigation.transferSize;
      const decodedSize = navigation.decodedBodySize;

      console.log("📦 Bundle Analysis:");
      console.log(`   Transfer Size: ${(bundleSize / 1024).toFixed(2)} KB`);
      console.log(`   Decoded Size: ${(decodedSize / 1024).toFixed(2)} KB`);
      console.log(
        `   Compression Ratio: ${((1 - bundleSize / decodedSize) * 100).toFixed(
          1
        )}%`
      );

      // Recommendations
      if (bundleSize > 500 * 1024) {
        // 500KB
        console.warn("⚠️  Large bundle detected - consider code splitting");
      }
      if (decodedSize > 1000 * 1024) {
        // 1MB
        console.warn("⚠️  Very large decoded bundle - optimize imports");
      }
    }
  }
}

// Export loading components for reuse
export { DefaultLoading, CardLoading, TableLoading, ChartLoading };
