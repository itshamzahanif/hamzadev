import { AnalyticsEvent } from "@/types/types";

type AnalyticsPayload = {
  event: AnalyticsEvent;
  path?: string;
  referrer?: string;
  title?: string;
  projectId?: string;
  isAutomated?: boolean;
  metadata?: Record<string, unknown>;
};

export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventName, parameters);
}

export async function trackAppEvent(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  const eventId = crypto.randomUUID();

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        eventId,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error("Analytics tracking failed:", error);
  }
}
