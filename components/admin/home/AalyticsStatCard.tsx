"use client";

import { AnalyticsEventName } from "@/generated/prisma/enums";
import { motion } from "framer-motion";

type AnalyticsItem =
  | { referrer: string | null; count: number }
  | { event: AnalyticsEventName; count: number }
  | { device: string | null; count: number }
  | { country: string | null; count: number }
  | { project: string | null; count: number }
  | { city: string | null; count: number };

interface StatCardProps {
  title: string;
  analytics: AnalyticsItem[];
  index: number;
}

const formateTitle = (title: string) => {
  switch (title) {
    case "referrers":
      return "Referrers";
    case "eventCounts":
      return "Event Counts";
    case "devices":
      return "Devices";
    case "projectClick":
      return "Project Clicks";
    case "countries":
      return "Countries";
    case "cities":
      return "Cities";
  }
};

const formatEventName = (event: string) => {
  const formattedEvent = event
    ? event
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
    : event;

  return formattedEvent;
};

const AnalyticsStatCard = ({ title, analytics, index }: StatCardProps) => {
  const maxValue = Math.max(...analytics.map((item) => item.count));
  console.log("AalyticsStatCard:analytics", analytics);
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 px-4"
    >
      <p className="text-sm font-medium text-slate-400 border-b border-slate-600 w-full pb-2 mb-4">
        {formateTitle(title)}
      </p>
      <div className="h-40 w-full overflow-y-auto px-1">
        {analytics.map((item) => {
          const labelKey = Object.keys(item).find((key) => key !== "count");

          const rawValue = labelKey
            ? item[labelKey as keyof typeof item]
            : null;

          const label =
            rawValue !== null && rawValue !== undefined
              ? title === "eventCounts"
                ? formatEventName(String(rawValue))
                : String(rawValue)
              : null;

          const percentage = Math.round((item.count / maxValue) * 100);

          return (
            <div
              key={String(label) + item.count + index}
              className="group relative rounded-md py-1.5 px-2 my-1 transition-colors hover:bg-slate-800/40"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-indigo-500/10 transition-all duration-300 group-hover:bg-indigo-500/20"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex justify-between">
                <span className="w-[80%] wrap-break-word">{label}</span>
                <span>{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnalyticsStatCard;
