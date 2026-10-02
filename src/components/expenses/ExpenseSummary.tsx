import { formatExpenseCurrency, type ExpenseSummary as ExpenseSummaryData } from "../../services/expenseService";

interface ExpenseSummaryProps {
  summary: ExpenseSummaryData;
  yearLabel: string;
}

export default function ExpenseSummary({ summary, yearLabel }: ExpenseSummaryProps) {
  const cards = [
    { label: "Total collection", amount: summary.totalCollection, note: `Collection recorded for ${yearLabel}`, accent: "#2563EB", tint: "#EFF6FF", icon: "↓" },
    { label: "Total expenses", amount: summary.totalExpense, note: "Across all four periods", accent: "#D97706", tint: "#FFFBEB", icon: "↗" },
    { label: "Remaining balance", amount: summary.remainingBalance, note: "Collection minus expenses", accent: summary.remainingBalance < 0 ? "#DC2626" : "#059669", tint: summary.remainingBalance < 0 ? "#FEF2F2" : "#ECFDF5", icon: "=" },
  ];

  return (
    <section aria-label={`Financial summary for ${yearLabel}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="flex min-w-0 items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.035)] sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 break-words font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{formatExpenseCurrency(card.amount)}</p>
            <p className="mt-2 text-xs text-slate-400">{card.note}</p>
          </div>
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold" style={{ color: card.accent, backgroundColor: card.tint }}>{card.icon}</span>
        </article>
      ))}
    </section>
  );
}
