"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getApiBase } from "@/lib/api-config";

interface ChipData {
  label: string;
  value: string | number;
  link: string;
  color: "blue" | "purple" | "green" | "orange";
}

export default function SuggestionChips() {
  const [chips, setChips] = useState<ChipData[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    async function fetchData() {
      const API_URL = getApiBase();
      
      try {
        const [execRes, revRes] = await Promise.all([
          fetch(`${API_URL}/api/guardian/executive-summary`, { cache: "no-store" }),
          fetch(`${API_URL}/api/guardian/revenue/summary`, { cache: "no-store" })
        ]);

        const newChips: ChipData[] = [];

        if (execRes.ok) {
          const exec = await execRes.json();
          const healthScore = exec.health_score ?? 0;
          newChips.push({
            label: "Brain",
            value: `${healthScore}/100`,
            link: `/${locale}/brain`,
            color: healthScore >= 80 ? "green" : healthScore >= 60 ? "orange" : "purple"
          });
          
          const openPlans = exec.sections?.upgrade_plans?.high_priority_open ?? 0;
          if (openPlans > 0) {
            newChips.push({
              label: "Guardian",
              value: `${openPlans} high priority`,
              link: `/${locale}/brain#upgrades`,
              color: "orange"
            });
          }
        }

        if (revRes.ok) {
          const rev = await revRes.json();
          const leads7d = rev.leads?.last_7_days ?? 0;
          if (leads7d > 0) {
            newChips.push({
              label: "Revenue",
              value: `${leads7d} leads (7d)`,
              link: `/${locale}/revenue`,
              color: "blue"
            });
          }
        }

        setChips(newChips);
      } catch (err) {
        console.error("Chips fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locale]);

  if (loading || chips.length === 0) {
    return null;
  }

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    orange: "bg-orange-100 text-orange-700 hover:bg-orange-200"
  };

  return (
    <div className="fixed bottom-20 right-6 z-30 flex flex-col gap-2 items-end">
      {chips.map((chip, idx) => (
        <Link
          key={idx}
          href={chip.link}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-colors ${colorClasses[chip.color]}`}
        >
          {chip.label}: {chip.value}
        </Link>
      ))}
    </div>
  );
}
