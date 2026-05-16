// Prefetch routes on hover for instant navigation
export function prefetchRoute(route: string) {
  if (typeof window === "undefined") return;
  
  // Use Link prefetch behavior via native approach
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Critical routes that should always be prefetched
export const CRITICAL_ROUTES = [
  "/launcher",
  "/",
  "/students",
  "/attendance",
  "/fees",
];

// Image loading strategies
export const IMAGE_PLACEHOLDERS = {
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e2e8f0'/%3E%3Ctext x='20' y='25' font-size='16' fill='%2394a3b8' text-anchor='middle'%3EU%3C/text%3E%3C/svg%3E",
  card: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f1f5f9'/%3E%3C/svg%3E",
};

// Check if running in browser
export const isBrowser = typeof window !== "undefined";

// Lazy load utility for heavy components
export function lazyLoad<T>(importFn: () => Promise<{ default: T }>) {
  return async () => {
    const mod = await importFn();
    return { default: mod.default };
  };
}