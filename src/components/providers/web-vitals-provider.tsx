// Web Vitals Provider - Initialize tracking in the app
"use client";

import { useEffect } from "react";
import { initializeWebVitalsTracking } from "@/lib/web-vitals";

export function WebVitalsProvider() {
  useEffect(() => {
    initializeWebVitalsTracking();
  }, []);

  return null;
}
