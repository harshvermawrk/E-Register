import { useState, useMemo } from "react";
import { members, transactions, type Member, type MemberStatus } from "../data/mockData";

type FilterType = "All" | MemberStatus;

function StatusBadge({ status }: { status: MemberStatus }) {
  const styles: Record<MemberStatus, { bg: string; color: string; dot: string }> = {
    Active: { bg: "rgba(5,150,105,0.1)", color: "#059669", dot: "#059669" },
    Inactive: { bg: "rgba(100,116,139,0.1)", color: "#64748B", dot: "#94A3B8" },
    Pending: { bg: "rgba(217,119,6,0.1)", color: "#D97706", dot: "#D97706" },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: "Paid" | "Pending" | "Failed" }) {
  const styles = {
    Paid: { bg: "rgba(5,150,105,0.1)", color: "#059669" },
    Pending: { bg: "rgba(217,119,6,0.1)", color: "#D97706" },
    Failed: { bg: "rgba(239,68,68,0.1)", color: "#DC2626" },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

interface MemberManagementProps {
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
}

const PAGE_SIZE = 6;

export default function MemberManagement({ selectedMemberId, onSelectMember }: MemberManagementProps) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "hometown" | "joinDate">("name");
  const [leftFilter, setLeftFilter] = useState<FilterType>("All");
  const [page, setPage] = useState(1);

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const matchesFilter = filter === "All" || m.status === filter;
        const matchesSearch =
          search === "" ||
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.hometown.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search) ||
          m.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name);
        if (sortKey === "hometown") return a.hometown.localeCompare(b.hometown);
        return a.joinDate.localeCompare(b.joinDate);
      });
  }, [filter, search, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedMembers = useMemo(
    () => filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredMembers, currentPage]
  );

  // Reset to page 1 whenever the result set changes so we never land on an empty page.
  const resetPage = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const recentlyAdded = useMemo(
    () => [...members].sort((a, b) => b.sno - a.sno).slice(0, 5),
    []
  );

  const leftFiltered = useMemo(
    () => leftFilter === "All" ? recentlyAdded : recentlyAdded.filter(m => m.status === leftFilter),
    [leftFilter]
  );

  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? members[0];
  const memberTransactions = transactions.filter((t) => t.memberId === selectedMember.id);

  const filterCounts: Record<FilterType, number> = {
    All: members.length,
    Active: members.filter((m) => m.status === "Active").length,
    Inactive: members.filter((m) => m.status === "Inactive").length,
    Pending: members.filter((m) => m.status === "Pending").length,
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5" style={{ minHeight: "520px" }}>
      {/* LEFT PANEL (25% on desktop) */}
      <div
        className="rounded-[12px] flex flex-col overflow-hidden shrink-0 w-full xl:w-[25%]"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          maxHeight: "420px",
        }}
      >
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
              Members
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "#2563EB" }}
            >
              {members.length}
            </span>
          </div>
          {/* Quick filters */}
          <div className="flex flex-wrap gap-1.5">
            {(["All", "Active", "Inactive", "Pending"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setLeftFilter(f)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: leftFilter === f ? "#2563EB" : "#F1F5F9",
                  color: leftFilter === f ? "#ffffff" : "#64748B",
                }}
              >
                {f}
                {f !== "All" && (
                  <span className="ml-1 opacity-70">({filterCounts[f]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Added label */}
        <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
          Recently Added
        </p>

        {/* Member mini-list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {leftFiltered.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
              style={{
                backgroundColor: selectedMemberId === member.id ? "rgba(37,99,235,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedMemberId !== member.id)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                if (selectedMemberId !== member.id)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <Avatar initials={member.initials} color={member.avatarColor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#0F172A" }}>{member.name}</p>
                <p className="text-xs truncate" style={{ color: "#94A3B8" }}>{member.joinDate}</p>
              </div>
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: member.status === "Active" ? "#059669" : member.status === "Pending" ? "#D97706" : "#94A3B8",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* CENTER PANEL (45% on desktop) */}
      <div
        className="rounded-[12px] flex flex-col overflow-hidden w-full xl:flex-[0_0_45%]"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        }}
      >
        {/* Search + sort bar (sticky within the panel while the table scrolls) */}
        <div className="sticky top-0 z-[2] px-5 pt-5 pb-4 border-b space-y-3" style={{ borderColor: "#E2E8F0", backgroundColor: "#ffffff" }}>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 transition-colors"
              style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <label htmlFor="member-search" className="sr-only">Search members by name, city, or phone</label>
              <input
                id="member-search"
                type="text"
                value={search}
                onChange={(e) => resetPage(() => setSearch(e.target.value))}
                placeholder="Search by name, city, phone..."
                className="bg-transparent text-sm outline-none flex-1"
                style={{ color: "#0F172A" }}
              />
              {search && (
                <button onClick={() => resetPage(() => setSearch(""))} aria-label="Clear search" style={{ color: "#94A3B8" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {/* Sort */}
            <label htmlFor="member-sort" className="sr-only">Sort members</label>
            <select
              id="member-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="focus-ring text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#374151",
                fontFamily: "inherit",
              }}
            >
              <option value="name">Sort: Name</option>
              <option value="hometown">Sort: City</option>
              <option value="joinDate">Sort: Join Date</option>
            </select>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter members by status">
            {(["All", "Active", "Inactive", "Pending"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => resetPage(() => setFilter(f))}
                aria-pressed={filter === f}
                className="focus-ring px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filter === f ? "#2563EB" : "#F1F5F9",
                  color: filter === f ? "#ffffff" : "#64748B",
                  border: filter === f ? "1px solid #2563EB" : "1px solid transparent",
                }}
              >
                {f} {f !== "All" && `(${filterCounts[f]})`}
              </button>
            ))}
            <span className="ml-auto text-xs" style={{ color: "#94A3B8" }}>
              {filteredMembers.length} result{filteredMembers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["S.No", "Name", "Hometown", "Phone Number", "Status"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#64748B", whiteSpace: "nowrap" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedMembers.map((member, i) => (
                <tr
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectMember(member.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedMemberId === member.id}
                  aria-label={`View ${member.name}'s profile`}
                  className={`focus-ring ${i % 2 === 1 ? "zebra-row-even" : ""} ${selectedMemberId === member.id ? "table-row-selected" : "table-row-hover"}`}
                  style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                >
                  <td className="px-4 py-3 text-xs" style={{ color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>
                    {String(member.sno).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={member.initials} color={member.avatarColor} size="sm" />
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#0F172A" }}>{member.name}</p>
                        <p className="text-xs" style={{ color: "#94A3B8" }}>{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#475569" }}>{member.hometown}</td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "#475569", fontSize: "12px" }}>{member.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={member.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>No members found</p>
              <button
                onClick={() => resetPage(() => { setSearch(""); setFilter("All"); })}
                className="focus-ring text-xs rounded"
                style={{ color: "#2563EB" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Showing {pagedMembers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} members
          </p>
          <nav className="flex items-center gap-1" aria-label="Members table pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="focus-ring w-7 h-7 rounded text-xs flex items-center justify-center disabled:opacity-40"
              style={{ color: "#64748B" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {Array.from({ length: pageCount }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={currentPage === p ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className="focus-ring w-7 h-7 rounded text-xs font-medium flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: currentPage === p ? "#2563EB" : "transparent",
                    color: currentPage === p ? "#ffffff" : "#64748B",
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              aria-label="Next page"
              className="focus-ring w-7 h-7 rounded text-xs flex items-center justify-center disabled:opacity-40"
              style={{ color: "#64748B" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* RIGHT PANEL (30% on desktop) */}
      <div
        className="rounded-[12px] flex flex-col overflow-hidden w-full xl:flex-[0_0_30%]"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        }}
      >
        {/* Profile header */}
        <div
          className="px-5 pt-6 pb-5 flex flex-col items-center text-center border-b"
          style={{
            borderColor: "#E2E8F0",
            background: "linear-gradient(to bottom, #F8FAFC, #ffffff)",
          }}
        >
          <div className="relative mb-3">
            <Avatar initials={selectedMember.initials} color={selectedMember.avatarColor} size="lg" />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
              style={{
                backgroundColor: selectedMember.status === "Active" ? "#059669" : selectedMember.status === "Pending" ? "#D97706" : "#94A3B8",
              }}
            />
          </div>
          <h3 className="font-semibold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
            {selectedMember.name}
          </h3>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-medium mt-1"
            style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "#2563EB" }}
          >
            {selectedMember.id}
          </span>
          <div className="mt-2">
            <StatusBadge status={selectedMember.status} />
          </div>
        </div>

        {/* Member details */}
        <div className="px-5 py-4 space-y-3 border-b" style={{ borderColor: "#E2E8F0" }}>
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              ),
              label: "Phone",
              value: selectedMember.phone,
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              label: "Hometown",
              value: selectedMember.hometown,
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              label: "Joined",
              value: selectedMember.joinDate,
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ),
              label: "Outstanding",
              value: selectedMember.outstandingAmount === 0
                ? "No dues"
                : `₹${selectedMember.outstandingAmount.toLocaleString("en-IN")}`,
              valueStyle: selectedMember.outstandingAmount > 0 ? { color: "#DC2626", fontWeight: 600 } : { color: "#059669", fontWeight: 600 },
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ),
              label: "Last Payment",
              value: selectedMember.lastPaymentDate,
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F8FAFC" }}>
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: "#94A3B8" }}>{row.label}</p>
                <p className="text-sm font-medium truncate" style={{ color: "#0F172A", ...row.valueStyle }}>{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
              Transaction History
            </h4>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
            >
              {memberTransactions.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1">
            {memberTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-1">
                <p className="text-sm" style={{ color: "#94A3B8" }}>No transactions</p>
              </div>
            ) : (
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Date</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Amount</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Mode</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Status</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Rcpt</th>
                  </tr>
                </thead>
                <tbody>
                  {memberTransactions.map((txn) => (
                    <tr key={txn.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td className="px-3 py-2.5" style={{ color: "#475569", whiteSpace: "nowrap" }}>{txn.date}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>
                          {txn.paymentMode}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <PaymentStatusBadge status={txn.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          className="focus-ring text-xs font-medium px-2 py-0.5 rounded transition-colors"
                          style={{
                            backgroundColor: "transparent",
                            color: "#2563EB",
                            border: "1px solid #BFDBFE",
                          }}
                          aria-label={`View receipt ${txn.receiptId} for ${txn.date}`}
                          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#EFF6FF"}
                          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
