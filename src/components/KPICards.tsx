import type { ReactNode } from "react";
import { kpiData } from "../data/mockData";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  iconBg: string;
  accentColor: string;
}

function KPICard({ title, value, change, changeLabel, icon, iconBg, accentColor }: KPICardProps) {
  const isPositive = change >= 0;
  return (
    <div
      className="card-hover rounded-[12px] p-6 flex flex-col gap-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>{title}</p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A", letterSpacing: "-0.02em" }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: isPositive ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
            color: isPositive ? "#059669" : "#DC2626",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {isPositive ? (
              <>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </>
            ) : (
              <>
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </>
            )}
          </svg>
          {Math.abs(change)}%
        </div>
        <span className="text-xs" style={{ color: "#94A3B8" }}>{changeLabel}</span>
      </div>
    </div>
  );
}

export default function KPICards() {
  const cards: KPICardProps[] = [
    {
      title: "Total Members",
      value: kpiData.totalMembers.toLocaleString("en-IN"),
      change: kpiData.totalMembersGrowth,
      changeLabel: "vs last year",
      iconBg: "rgba(37,99,235,0.1)",
      accentColor: "#2563EB",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Total Collection",
      value: "₹" + (kpiData.totalCollection / 100000).toFixed(2) + "L",
      change: kpiData.totalCollectionGrowth,
      changeLabel: "vs last year",
      iconBg: "rgba(5,150,105,0.1)",
      accentColor: "#059669",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "Pending Payments",
      value: "₹" + (kpiData.pendingPayments / 100000).toFixed(2) + "L",
      change: kpiData.pendingPaymentsChange,
      changeLabel: "vs last month",
      iconBg: "rgba(217,119,6,0.1)",
      accentColor: "#D97706",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: "Yearly Growth",
      value: kpiData.yearlyGrowth + "%",
      change: kpiData.yearlyGrowthChange,
      changeLabel: "vs last year",
      iconBg: "rgba(124,58,237,0.1)",
      accentColor: "#7C3AED",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  );
}
