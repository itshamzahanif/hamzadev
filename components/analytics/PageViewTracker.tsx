"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackAppEvent } from "@/lib/analytics";
import { isHeadlessBot } from "@/lib/isHeadlessBot";

export function PageViewTracker() {
  const pathname = usePathname();

  console.log("PageViewTracker:hit");

  useEffect(() => {
    if (!pathname) return;

    // Headless bot evaluation
    const automated = isHeadlessBot();
    if (automated) return;

    const key = `analytics-pageview:${pathname}`;
    const lastViewed = sessionStorage.getItem(key);

    if (lastViewed) {
      const elapsed = Date.now() - Number(lastViewed);
      if (elapsed < 30_000) return;
    }

    sessionStorage.setItem(key, Date.now().toString());

    trackAppEvent({
      event: "page_view",
      path: pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      isAutomated: false,
    });
  }, [pathname]);

  return null;
}
