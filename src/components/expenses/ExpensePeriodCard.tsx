import { formatExpenseCurrency, type ExpensePeriod, type ExpenseRecord } from "../../services/expenseService";

interface ExpensePeriodCardProps {
  period: ExpensePeriod;
  expenses: ExpenseRecord[];
  total: number;
  expanded: boolean;
  search: string;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (expense: ExpenseRecord) => void;
}

function formatExpenseDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ExpensePeriodCard({ period, expenses, total, expanded, search, onToggle, onAdd, onEdit, onDelete }: ExpensePeriodCardProps) {
  const hasSearch = search.trim().length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <header className="flex min-w-0 items-center gap-3 p-4 sm:p-5">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform ${expanded ? "rotate-90" : ""}`} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-semibold text-slate-900">{period.name}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{period.dateRange} · {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}</span>
          </span>
        </button>
        <div className="shrink-0 text-right">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">Period total</span>
          <span className="mt-1 block text-sm font-semibold tabular-nums text-slate-800">{formatExpenseCurrency(total)}</span>
        </div>
      </header>

      {expanded && (
        <div className="border-t border-slate-100">
          {expenses.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-600">{hasSearch ? "No expenses match this search." : "No expenses recorded for this period."}</p>
              <p className="mt-1 text-xs text-slate-400">Add an expense to start tracking this period.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:flex-nowrap sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{expense.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatExpenseDate(expense.date)}{expense.notes ? ` · ${expense.notes}` : ""}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-slate-800">{formatExpenseCurrency(expense.amount)}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => onEdit(expense)} aria-label={`Edit ${expense.title}`} className="focus-ring rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50">Edit</button>
                    <button type="button" onClick={() => onDelete(expense)} aria-label={`Delete ${expense.title}`} className="focus-ring rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-slate-700">Period total <span className="ml-2 tabular-nums text-slate-900">{formatExpenseCurrency(total)}</span></p>
            <button type="button" onClick={onAdd} className="action-button w-full border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 sm:w-auto">+ Add expense</button>
          </footer>
        </div>
      )}
    </section>
  );
}
