# Next.js Optimization Guide for Surlamap

## 🚀 **Performance Optimizations Implemented**

### **1. Static Site Generation (SSG) + Client Hydration**

**✅ Events Page Optimization:**

- **Server-side data fetching** at build time
- **5-minute revalidation** for fresh content
- **Client-side interactivity** for search and user actions
- **Suspense boundaries** for smooth loading

```typescript
// app/events/page.tsx - Server Component
export const revalidate = 300; // 5 minutes

async function getEventsData() {
  const supabase = await createClient();
  // Pre-fetch events at build time
}

export default async function EventsPage() {
  const initialEvents = await getEventsData();
  return <EventsClient initialEvents={initialEvents} />;
}
```

### **2. React Cache for Database Queries**

**✅ Cached Database Operations:**

```typescript
// lib/nextjs-optimizations.ts
export const getCachedEvents = cache(async () => {
  // Database query cached across requests
});

export const getCachedEvent = cache(async (eventId: string) => {
  // Individual event caching
});
```

### **3. Image Optimization**

**✅ Automatic Image Optimization:**

```typescript
// Optimize Supabase storage images
export const optimizeImageUrl = (url: string, width: number = 400) => {
  if (url.includes("supabase.co")) {
    return `${url}?width=${width}&quality=80`;
  }
  return url;
};
```

## 🎯 **Recommended Next Steps**

### **1. Event Detail Pages (ISR)**

Create optimized event detail pages:

```typescript
// app/events/[id]/page.tsx
export async function generateStaticParams() {
  const events = await getCachedEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getCachedEvent(params.id);
  return generateEventMetadata(event);
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getCachedEvent(params.id);
  return <EventDetailClient event={event} />;
}
```

### **2. Dashboard Optimization**

```typescript
// app/dashboard/organizer/page.tsx
export const dynamic = "force-dynamic"; // Always fresh for dashboards
export const revalidate = 0; // No caching for real-time data

// Use streaming for better UX
export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

### **3. Search Optimization**

```typescript
// Implement search with debouncing and caching
const useSearchWithCache = (query: string) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        const cachedResults = await searchWithCache(query);
        setResults(cachedResults);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading };
};
```

## 📊 **Performance Monitoring**

### **1. Core Web Vitals Tracking**

```typescript
// lib/performance.ts
export const trackCoreWebVitals = () => {
  if (typeof window !== "undefined") {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};
```

### **2. Custom Performance Metrics**

```typescript
// Track event page load times
export const measureEventPageLoad = () => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`Event page loaded in ${duration}ms`);
  };
};
```

## 🔧 **Bundle Optimization**

### **1. Dynamic Imports**

```typescript
// Lazy load heavy components
const EventCalendar = dynamic(() => import("./EventCalendar"), {
  loading: () => <CalendarSkeleton />,
  ssr: false, // Client-only component
});

const Analytics = dynamic(() => import("./Analytics"), {
  ssr: false,
});
```

### **2. Tree Shaking**

```typescript
// Import only what you need
import { Button } from "@/components/ui/button";
// Instead of: import * from '@/components/ui';
```

## 🗄️ **Caching Strategies**

### **1. Browser Caching**

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/events",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};
```

### **2. API Route Caching**

```typescript
// app/api/events/route.ts
export async function GET() {
  const events = await getCachedEvents();

  return Response.json(events, {
    headers: {
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
```

## 🎨 **UI/UX Optimizations**

### **1. Skeleton Loading States**

```typescript
// components/ui/skeleton.tsx
export function EventCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

### **2. Progressive Loading**

```typescript
// Load critical content first, then enhance
export default function EventsPage() {
  return (
    <>
      <CriticalContent />
      <Suspense fallback={<NonCriticalSkeleton />}>
        <NonCriticalContent />
      </Suspense>
    </>
  );
}
```

## 📈 **SEO Optimizations**

### **1. Dynamic Metadata**

```typescript
// Generate SEO-friendly metadata
export async function generateMetadata({ params }) {
  const event = await getCachedEvent(params.id);

  return {
    title: `${event.name} - Surlamap`,
    description: event.description,
    openGraph: {
      title: event.name,
      description: event.description,
      images: [event.image_url],
    },
  };
}
```

### **2. Structured Data**

```typescript
// Add JSON-LD for events
const eventStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.name,
  startDate: event.date,
  location: {
    "@type": "Place",
    name: event.location,
  },
};
```

## 🚀 **Deployment Optimizations**

### **1. Vercel Configuration**

```json
// vercel.json
{
  "functions": {
    "app/events/page.tsx": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/events",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=300"
        }
      ]
    }
  ]
}
```

### **2. Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 📊 **Performance Metrics to Monitor**

1. **First Contentful Paint (FCP)**: < 1.8s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **First Input Delay (FID)**: < 100ms
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **Time to First Byte (TTFB)**: < 600ms

## 🎯 **Implementation Priority**

1. **High Priority**: Event detail pages with ISR
2. **Medium Priority**: Dashboard streaming and caching
3. **Low Priority**: Advanced analytics and monitoring

This optimization strategy will give you:

- ⚡ **Faster page loads** (SSG + caching)
- 🔍 **Better SEO** (static generation)
- 💾 **Reduced server load** (cached queries)
- 📱 **Better mobile performance** (optimized images)
- 🎯 **Improved user experience** (skeleton loading)
