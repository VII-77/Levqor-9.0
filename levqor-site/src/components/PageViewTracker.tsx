"use client";

import { useEffect } from "react";

type PageViewTrackerProps = {
  eventType?: string;
  page: string;
};

export default function PageViewTracker({
  eventType = "page_view",
  page,
}: PageViewTrackerProps) {
  useEffect(() => {
    const payload = {
      event_type: eventType,
      page,
    };

    fetch("/api/marketing/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // keepalive prevents the browser from cancelling on navigation
      keepalive: true,
    }).catch(() => {
      // Silently ignore errors – analytics must NEVER break UX
    });
  }, [eventType, page]);

  return null;
}
