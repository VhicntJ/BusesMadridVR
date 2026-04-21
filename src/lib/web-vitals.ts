// Core Web Vitals tracking for improved performance monitoring
// Measures: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)

export interface WebVitals {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface WindowWithGtag extends Window {
  gtag?: (...args: unknown[]) => void;
}

// Thresholds for Core Web Vitals (Google standards)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 600, poor: 1800 }, // Time to First Byte (ms)
};

function getRating(
  value: number,
  good: number,
  poor: number
): "good" | "needs-improvement" | "poor" {
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

// Track Largest Contentful Paint
export function trackLCP(callback: (metric: WebVitals) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry | undefined;
      if (!lastEntry) return;

      const value = lastEntry.renderTime ?? lastEntry.loadTime ?? 0;
      const metric: WebVitals = {
        name: "LCP",
        value,
        rating: getRating(value, THRESHOLDS.LCP.good, THRESHOLDS.LCP.poor),
      };

      callback(metric);
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });

    return () => observer.disconnect();
  } catch (e) {
    console.error("Error tracking LCP:", e);
  }
}

// Track Cumulative Layout Shift
export function trackCLS(callback: (metric: WebVitals) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    let clsValue = 0;
    let previousSessionValue = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const typedEntry = entry as LayoutShiftEntry;
        if (!typedEntry.hadRecentInput) {
          clsValue += typedEntry.value;

          if (clsValue - previousSessionValue < 1) {
            previousSessionValue = clsValue;
          } else {
            previousSessionValue = typedEntry.value;
            clsValue = typedEntry.value;
          }
        }
      }

      const metric: WebVitals = {
        name: "CLS",
        value: clsValue,
        rating: getRating(clsValue, THRESHOLDS.CLS.good, THRESHOLDS.CLS.poor),
      };

      callback(metric);
    });

    observer.observe({ type: "layout-shift", buffered: true });

    return () => observer.disconnect();
  } catch (e) {
    console.error("Error tracking CLS:", e);
  }
}

// Track First Input Delay (now replaced by INP in some cases)
export function trackFID(callback: (metric: WebVitals) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as FirstInputEntry | undefined;
      if (!firstEntry) return;

      const value = firstEntry.processingStart - firstEntry.startTime;
      const metric: WebVitals = {
        name: "FID",
        value,
        rating: getRating(value, THRESHOLDS.FID.good, THRESHOLDS.FID.poor),
      };

      callback(metric);
    });

    observer.observe({ type: "first-input", buffered: true });

    return () => observer.disconnect();
  } catch (e) {
    console.error("Error tracking FID:", e);
  }
}

// Track Time to First Byte
export function trackTTFB(callback: (metric: WebVitals) => void) {
  if (!("performance" in window)) return;

  try {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const value = navigation.responseStart;
    const metric: WebVitals = {
      name: "TTFB",
      value,
      rating: getRating(value, THRESHOLDS.TTFB.good, THRESHOLDS.TTFB.poor),
    };

    callback(metric);
  } catch (e) {
    console.error("Error tracking TTFB:", e);
  }
}

// Send metrics to analytics
export function sendMetricToAnalytics(metric: WebVitals) {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as WindowWithGtag;

  // Send to Google Analytics 4
  if (analyticsWindow.gtag) {
    analyticsWindow.gtag("event", metric.name.toLowerCase(), {
      value: Math.round(metric.value),
      event_category: "web_vitals",
      event_label: metric.rating,
      non_interaction: true,
    });
  }

  // Send to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(` ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
  }
}

// Initialize all trackers
export function initializeWebVitalsTracking() {
  trackLCP(sendMetricToAnalytics);
  trackCLS(sendMetricToAnalytics);
  trackFID(sendMetricToAnalytics);
  trackTTFB(sendMetricToAnalytics);
}
