import { members, type Member, type MemberStatus } from "./mockData";

export type ManagedMember = Member & { accountNumber: string; entryAmount?: number };

export type MemberFields = Pick<Member, "name" | "hometown" | "phone" | "joinDate" | "status">;
export type YearWiseEntryFields = Pick<Member, "name" | "joinDate"> & { amount: number };

export const financialYears = ["2026-27", "2025-26", "2024-25"] as const;
export const annualMembershipFee = 12000;

export const initialManagedMembers: ManagedMember[] = members.map((member) => ({
  ...member,
  accountNumber: `6100${String(member.sno).padStart(6, "0")}`,
}));

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function parseMemberDate(value: string) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return date.getFullYear() === Number(isoMatch[1]) && date.getMonth() === Number(isoMatch[2]) - 1 && date.getDate() === Number(isoMatch[3]) ? date : null;
  }

  const localizedMatch = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(value);
  if (localizedMatch) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(localizedMatch[2].toLowerCase());
    if (month < 0) return null;
    const date = new Date(Number(localizedMatch[3]), month, Number(localizedMatch[1]));
    return date.getFullYear() === Number(localizedMatch[3]) && date.getMonth() === month && date.getDate() === Number(localizedMatch[1]) ? date : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getMemberEntryYear(value: string) {
  return parseMemberDate(value)?.getFullYear() ?? null;
}

export function formatMemberDate(value: string) {
  const date = parseMemberDate(value);
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : value;
}

export function toDateInput(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function memberFinancials(member: ManagedMember, year: string) {
  const yearIndex = Math.max(0, financialYears.indexOf(year as (typeof financialYears)[number]));
  const due = yearIndex === 0
    ? Math.min(member.outstandingAmount, annualMembershipFee)
    : yearIndex === 1
      ? member.status === "Inactive"
        ? Math.min(member.outstandingAmount, annualMembershipFee)
        : member.sno % 5 === 0 ? 1500 : 0
      : member.sno % 7 === 0 ? 2500 : 0;
  const paid = annualMembershipFee - due;
  const paymentCount = Math.ceil(paid / 1000);
  const startYear = Number(year.slice(0, 4));
  let balance = 0;
  const statement = Array.from({ length: 12 }, (_, index) => {
    const monthIndex = (index + 3) % 12;
    const dateYear = monthIndex >= 3 ? startYear : startYear + 1;
    const credit = Math.min(1000, Math.max(0, paid - index * 1000));
    const monthlyDue = 1000 - credit;
    balance += monthlyDue;
    const date = credit > 0
      ? new Date(dateYear, monthIndex, 15).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";
    return { sno: index + 1, date, credit, due: monthlyDue, balance };
  });

  return { paid, due, paymentCount, statement };
}

export function createManagedMember(fields: MemberFields, sno: number, entryAmount?: number): ManagedMember {
  const idNumber = 2400 + sno;
  const palette = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#0891B2", "#BE185D"];
  const initials = fields.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  return {
    ...fields,
    id: `MF-${idNumber}`,
    sno,
    initials,
    avatarColor: palette[(sno - 1) % palette.length],
    accountNumber: `6100${String(sno).padStart(6, "0")}`,
    entryAmount,
    outstandingAmount: 0,
    lastPaymentDate: "—",
    email: "",
  };
}

export function statusTone(status: MemberStatus) {
  if (status === "Active") return { color: "#047857", background: "#ECFDF5", dot: "#10B981" };
  if (status === "Pending") return { color: "#B45309", background: "#FFFBEB", dot: "#F59E0B" };
  return { color: "#475569", background: "#F1F5F9", dot: "#94A3B8" };
}
