import { useMemo, useRef, useState, type FormEvent } from "react";
import * as XLSX from "xlsx";
import { members as seedMembers, type Member, type MemberStatus } from "../data/mockData";

type ManagedMember = Member & { address: string };
type MemberFilter = "All" | "Active" | "Pending";
type SortKey = "sno" | "name" | "hometown" | "joinDate";
type MemberForm = Pick<Member, "name" | "hometown" | "phone" | "joinDate" | "status"> & { address: string };

const avatarColors = ["#2457D6", "#087E78", "#C16435", "#6954B8", "#A44060", "#367B9C"];
const financialYears = ["2026-27", "2025-26", "2024-25"];
const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const annualExpected = 12000;

const initialMembers: ManagedMember[] = seedMembers.map((member) => ({
  ...member,
  address: `${member.hometown}, India`,
}));

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function currency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function StatusPill({ status }: { status: MemberStatus }) {
  const colors: Record<MemberStatus, { foreground: string; background: string; dot: string }> = {
    Active: { foreground: "#087E63", background: "#E8F5EF", dot: "#16966D" },
    Pending: { foreground: "#A85C12", background: "#FFF3E5", dot: "#D88727" },
    Inactive: { foreground: "#64748B", background: "#F1F4F8", dot: "#94A3B8" },
  };
  const color = colors[status];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: color.foreground, backgroundColor: color.background }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
      {status}
    </span>
  );
}

function ExcelActionIcon({ kind }: { kind: "import" | "export" }) {
  return kind === "import" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V3m0 0L8 7m4-4 4 4" />
      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function collectionFor(member: ManagedMember, yearIndex: number) {
  const due = yearIndex === 0
    ? Math.min(member.outstandingAmount, annualExpected)
    : yearIndex === 1
      ? member.status === "Inactive" ? Math.min(member.outstandingAmount, annualExpected) : member.sno % 5 === 0 ? 1500 : 0
      : member.sno % 7 === 0 ? 2500 : 0;
  const paid = annualExpected - due;
  const fullMonthsPaid = Math.floor(paid / 1000);
  const partialMonthPaid = paid % 1000;

  return {
    year: financialYears[yearIndex],
    expected: annualExpected,
    paid,
    due,
    status: due === 0 ? "Paid" : paid === 0 ? "Due" : "Partial",
    months: months.map((month, index) => {
      const monthPaid = index < fullMonthsPaid ? 1000 : index === fullMonthsPaid ? partialMonthPaid : 0;
      return {
        month,
        expected: 1000,
        paid: monthPaid,
        due: 1000 - monthPaid,
        status: monthPaid === 1000 ? "Paid" : monthPaid > 0 ? "Partial" : "Due",
      };
    }),
  };
}

function excelValue(row: Record<string, unknown>, aliases: string[]) {
  const values = new Map(Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]));
  for (const alias of aliases) {
    const value = values.get(alias.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (value !== undefined && value !== null && String(value).trim()) return value;
  }
  return "";
}

function formatJoinDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  return String(value || "").trim();
}

interface MemberManagementProps {
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
}

export default function MemberManagementPage({ selectedMemberId, onSelectMember }: MemberManagementProps) {
  const [memberRows, setMemberRows] = useState<ManagedMember[]>(initialMembers);
  const [filter, setFilter] = useState<MemberFilter>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sno");
  const [expandedYear, setExpandedYear] = useState("2026-27");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagedMember | null>(null);
  const [form, setForm] = useState<MemberForm>({ name: "", hometown: "", phone: "", address: "", joinDate: "", status: "Active" });
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedMember = memberRows.find((member) => member.id === selectedMemberId) ?? memberRows[0] ?? null;
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return memberRows
      .filter((member) => filter === "All" || member.status === filter)
      .filter((member) => !query || [member.name, member.hometown, member.phone, member.id, String(member.sno)].some((value) => value.toLocaleLowerCase().includes(query)))
      .sort((first, second) => {
        if (sortKey === "name") return first.name.localeCompare(second.name);
        if (sortKey === "hometown") return first.hometown.localeCompare(second.hometown);
        if (sortKey === "joinDate") return first.joinDate.localeCompare(second.joinDate);
        return first.sno - second.sno;
      });
  }, [filter, memberRows, search, sortKey]);

  const filterCounts: Record<MemberFilter, number> = {
    All: memberRows.length,
    Active: memberRows.filter((member) => member.status === "Active").length,
    Pending: memberRows.filter((member) => member.status === "Pending").length,
  };

  function openCreateForm() {
    setEditingMember(null);
    setForm({ name: "", hometown: "", phone: "", address: "", joinDate: "", status: "Active" });
    setFormOpen(true);
  }

  function openEditForm() {
    if (!selectedMember) return;
    setEditingMember(selectedMember);
    setForm({
      name: selectedMember.name,
      hometown: selectedMember.hometown,
      phone: selectedMember.phone,
      address: selectedMember.address,
      joinDate: selectedMember.joinDate,
      status: selectedMember.status,
    });
    setFormOpen(true);
  }

  function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sno = editingMember?.sno ?? Math.max(0, ...memberRows.map((member) => member.sno)) + 1;
    const savedMember: ManagedMember = {
      ...(editingMember ?? {
        id: `MF-${String(2400 + sno).padStart(4, "0")}`,
        initials: "",
        avatarColor: avatarColors[sno % avatarColors.length],
        outstandingAmount: 0,
        lastPaymentDate: "-",
        email: "",
      }),
      ...form,
      sno,
      initials: initialsFor(form.name),
    };

    setMemberRows((current) => editingMember
      ? current.map((member) => member.id === editingMember.id ? savedMember : member)
      : [...current, savedMember]);
    onSelectMember(savedMember.id);
    setFormOpen(false);
    setNotice(editingMember ? "Member details updated." : "Member added to the register.");
  }

  function deleteMember() {
    if (!selectedMember || !window.confirm(`Delete ${selectedMember.name} from the member register?`)) return;
    const nextMembers = memberRows.filter((member) => member.id !== selectedMember.id);
    setMemberRows(nextMembers);
    if (nextMembers[0]) onSelectMember(nextMembers[0].id);
    setNotice(`${selectedMember.name} was removed from the register.`);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(memberRows.map((member) => ({
      "S.No": member.sno,
      "Member ID": member.id,
      Name: member.name,
      City: member.hometown,
      Phone: member.phone,
      Address: member.address,
      "Join Date": member.joinDate,
      Status: member.status,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, "society-members.xlsx");
    setNotice("Member register exported as an Excel workbook.");
  }

  async function importExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = firstSheet ? XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" }) : [];
      const nextSno = Math.max(0, ...memberRows.map((member) => member.sno));
      const imported = rows.flatMap((row, index) => {
        const name = String(excelValue(row, ["Name", "Member Name"])).trim();
        if (!name) return [];
        const snoValue = Number(excelValue(row, ["S.No", "Serial Number", "Sno"]));
        const sno = Number.isFinite(snoValue) && snoValue > 0 ? snoValue : nextSno + index + 1;
        const city = String(excelValue(row, ["City", "Hometown"])).trim();
        const statusText = String(excelValue(row, ["Status"])).toLowerCase();
        const status: MemberStatus = statusText.includes("pending") ? "Pending" : statusText.includes("inactive") ? "Inactive" : "Active";
        return [{
          id: String(excelValue(row, ["Member ID", "ID"]) || `MF-${String(2400 + sno).padStart(4, "0")}`).trim(),
          sno,
          name,
          initials: initialsFor(name),
          avatarColor: avatarColors[sno % avatarColors.length],
          hometown: city,
          phone: String(excelValue(row, ["Phone", "Phone Number", "Mobile"])).trim(),
          status,
          joinDate: formatJoinDate(excelValue(row, ["Join Date", "Joined"])),
          address: String(excelValue(row, ["Address"])).trim() || `${city}, India`,
          outstandingAmount: 0,
          lastPaymentDate: "-",
          email: String(excelValue(row, ["Email", "Email Address"])).trim(),
        } satisfies ManagedMember];
      });

      if (imported.length === 0) {
        setNotice("No member rows found. Include a Name column and try again.");
        return;
      }
      setMemberRows((current) => {
        const merged = new Map(current.map((member) => [member.id, member]));
        imported.forEach((member) => merged.set(member.id, member));
        return [...merged.values()].sort((first, second) => first.sno - second.sno);
      });
      setNotice(`${imported.length} member${imported.length === 1 ? "" : "s"} imported.`);
    } catch {
      setNotice("This Excel file could not be read. Check the file and try again.");
    } finally {
      event.currentTarget.value = "";
    }
  }

  return (
    <div className="member-management-page h-full w-full px-5 pb-4 pt-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#74839B" }}>Society register</p>
          <h2 className="font-display text-[22px] font-semibold leading-tight" style={{ color: "#142743" }}>Member Management</h2>
          <p className="mt-1 text-xs" style={{ color: "#728198" }}>Search member records and review collection history.</p>
        </div>
        <div className="hidden items-center gap-2 text-xs sm:flex" style={{ color: "#718096" }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#16A078" }} />
          Register updated today
        </div>
      </div>

      {notice && (
        <div role="status" className="mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs" style={{ color: "#2457D6", backgroundColor: "#EDF4FF" }}>
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="ml-3 text-base leading-none">×</button>
        </div>
      )}

      <div className="member-management-workspace">
        <aside className="management-panel member-list-panel flex min-h-0 flex-col overflow-hidden">
          <div className="border-b p-3.5" style={{ borderColor: "#E6EBF1" }}>
            <button type="button" onClick={openCreateForm} className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white transition-colors" style={{ backgroundColor: "#2457D6" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Member
            </button>
            <input ref={fileInput} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden" aria-label="Choose Excel member file" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fileInput.current?.click()} className="focus-ring flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors hover:bg-slate-50" style={{ color: "#45556C", borderColor: "#E0E6EE" }}>
                <ExcelActionIcon kind="import" /> Import
              </button>
              <button type="button" onClick={exportExcel} className="focus-ring flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors hover:bg-slate-50" style={{ color: "#45556C", borderColor: "#E0E6EE" }}>
                <ExcelActionIcon kind="export" /> Export
              </button>
            </div>
          </div>

          <div className="p-2.5">
            <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#8996A9" }}>Member status</p>
            {(["Active", "Pending", "All"] as MemberFilter[]).map((item) => {
              const label = item === "All" ? "All Members" : `${item} Members`;
              const active = filter === item;
              return (
                <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={active} className="focus-ring mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-xs font-medium transition-colors" style={{ backgroundColor: active ? "#EEF4FF" : "transparent", color: active ? "#214FC1" : "#53637A" }}>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item === "Active" ? "#16966D" : item === "Pending" ? "#D88727" : active ? "#2457D6" : "#A7B2C1" }} />
                    {label}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: active ? "#5574B9" : "#8793A4" }}>{filterCounts[item]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto border-t px-3 py-3" style={{ borderColor: "#E6EBF1" }}>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "#7D8A9D" }}>Total registered</span>
              <span className="font-semibold tabular-nums" style={{ color: "#243752" }}>{memberRows.length}</span>
            </div>
          </div>
        </aside>

        <section className="management-panel member-table-panel flex min-h-0 flex-col overflow-hidden" aria-label="Member directory">
          <div className="border-b p-3.5" style={{ borderColor: "#E6EBF1" }}>
            <div className="flex items-center gap-2.5">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: "#E0E6EE", backgroundColor: "#FBFCFE" }}>
                <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8290A3" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" style={{ color: "#243752" }} placeholder="Name, city, serial no. or phone" aria-label="Search members by name, city, serial number, or phone" />
                {search && <button type="button" onClick={() => setSearch("")} className="text-xs" style={{ color: "#8491A3" }} aria-label="Clear search">×</button>}
              </label>
              <label className="sr-only" htmlFor="member-sort">Sort members</label>
              <select id="member-sort" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="focus-ring max-w-[116px] rounded-lg border bg-white px-2 py-2.5 text-[11px] outline-none" style={{ borderColor: "#E0E6EE", color: "#46566D" }}>
                <option value="sno">Sort: S.No</option>
                <option value="name">Sort: Name</option>
                <option value="hometown">Sort: City</option>
                <option value="joinDate">Sort: Join date</option>
              </select>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold" style={{ color: "#263955" }}>Member directory</h3>
              <span className="text-[11px] tabular-nums" style={{ color: "#7D8A9D" }}>{filteredMembers.length} members</span>
            </div>
          </div>

          <div className="member-table-scroll">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-[1]" style={{ backgroundColor: "#F7F9FC" }}>
                <tr className="border-b" style={{ borderColor: "#E7ECF2" }}>
                  {[
                    { label: "S.No", className: "w-[52px]" },
                    { label: "Name", className: "" },
                    { label: "City", className: "" },
                    { label: "Phone", className: "" },
                    { label: "Status", className: "" },
                  ].map((column) => <th key={column.label} className={`px-2.5 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] ${column.className}`} style={{ color: "#7E8B9E" }}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const selected = selectedMember?.id === member.id;
                  return (
                    <tr key={member.id} tabIndex={0} role="button" aria-pressed={selected} aria-label={`View ${member.name}, member ${member.sno}`} onClick={() => onSelectMember(member.id)} onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectMember(member.id);
                      }
                    }} className="member-directory-row cursor-pointer border-b transition-colors" style={{ borderColor: "#EEF1F5", backgroundColor: selected ? "#EFF5FF" : "#FFFFFF" }}>
                      <td className="px-2.5 py-3 text-[11px] tabular-nums" style={{ color: "#8290A3" }}>{String(member.sno).padStart(2, "0")}</td>
                      <td className="px-2.5 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: member.avatarColor }}>{member.initials}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-[11px] font-semibold" style={{ color: "#20344F" }}>{member.name}</span>
                            <span className="block truncate text-[9px]" style={{ color: "#8A96A7" }}>{member.id}</span>
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[100px] truncate px-2.5 py-3 text-[10px]" style={{ color: "#5E6D82" }}>{member.hometown}</td>
                      <td className="whitespace-nowrap px-2.5 py-3 text-[10px] tabular-nums" style={{ color: "#5E6D82" }}>{member.phone}</td>
                      <td className="px-2.5 py-3"><StatusPill status={member.status} /></td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-xs" style={{ color: "#8793A4" }}>No members match this search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-3.5 py-2.5 text-[10px]" style={{ borderColor: "#E7ECF2", color: "#8793A4" }}>
            <span>Showing {filteredMembers.length} of {memberRows.length}</span>
            <span>Sorted by {sortKey === "sno" ? "serial number" : sortKey === "hometown" ? "city" : sortKey === "joinDate" ? "join date" : "name"}</span>
          </div>
        </section>

        <aside className="management-panel member-profile-panel flex min-h-0 flex-col overflow-hidden" aria-label="Selected member profile">
          {selectedMember ? (
            <>
              <div className="border-b px-4 pb-3 pt-4" style={{ borderColor: "#E7ECF2" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: selectedMember.avatarColor }}>{selectedMember.initials}</div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[15px] font-semibold" style={{ color: "#1B304C" }}>{selectedMember.name}</h3>
                      <p className="mt-0.5 text-[10px]" style={{ color: "#75839A" }}>Member ID <span className="font-semibold" style={{ color: "#425674" }}>{selectedMember.id}</span></p>
                    </div>
                  </div>
                  <StatusPill status={selectedMember.status} />
                </div>
                <div className="member-profile-actions mt-3 flex gap-2">
                  <button type="button" onClick={openEditForm} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold" style={{ borderColor: "#DDE5EF", color: "#40536D" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" /></svg>Edit
                  </button>
                  <button type="button" onClick={deleteMember} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold" style={{ borderColor: "#F0D8D8", color: "#B34B4B" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg>Delete
                  </button>
                  <button type="button" onClick={() => window.print()} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold" style={{ borderColor: "#DDE5EF", color: "#40536D" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></svg>Print
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-b px-4 py-3.5" style={{ borderColor: "#E7ECF2" }}>
                <div><p className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: "#8995A6" }}>Phone</p><p className="mt-1 truncate text-[11px] font-medium" style={{ color: "#31445F" }}>{selectedMember.phone}</p></div>
                <div><p className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: "#8995A6" }}>City</p><p className="mt-1 truncate text-[11px] font-medium" style={{ color: "#31445F" }}>{selectedMember.hometown}</p></div>
                <div className="col-span-2"><p className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: "#8995A6" }}>Address</p><p className="mt-1 truncate text-[11px] font-medium" style={{ color: "#31445F" }}>{selectedMember.address || `${selectedMember.hometown}, India`}</p></div>
                <div><p className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: "#8995A6" }}>Join date</p><p className="mt-1 text-[11px] font-medium" style={{ color: "#31445F" }}>{selectedMember.joinDate}</p></div>
                <div><p className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: "#8995A6" }}>Outstanding</p><p className="mt-1 text-[11px] font-semibold" style={{ color: selectedMember.outstandingAmount ? "#B34B4B" : "#087E63" }}>{selectedMember.outstandingAmount ? currency(selectedMember.outstandingAmount) : "No dues"}</p></div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <h4 className="text-xs font-semibold" style={{ color: "#263955" }}>Year-wise collection</h4>
                    <p className="mt-0.5 text-[9px]" style={{ color: "#8995A6" }}>Annual dues and monthly payments</p>
                  </div>
                  <span className="rounded-md px-2 py-1 text-[9px] font-semibold" style={{ color: "#526987", backgroundColor: "#F2F5F9" }}>₹12,000 / yr</span>
                </div>
                <div className="member-collection-scroll min-h-0 flex-1 overflow-auto px-3 pb-3">
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-[1]" style={{ backgroundColor: "#F7F9FC" }}>
                      <tr>
                        {["Year", "Expected", "Paid", "Due", "Status"].map((label) => <th key={label} className="px-1.5 py-2 text-[8px] font-semibold uppercase tracking-[0.05em]" style={{ color: "#8793A4" }}>{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {financialYears.map((year, index) => {
                        const collection = collectionFor(selectedMember, index);
                        const expanded = expandedYear === year;
                        return (
                          <>{/* Year row and its monthly accordion */}
                            <tr key={year}>
                              <td colSpan={5} className="p-0">
                                <button type="button" onClick={() => setExpandedYear(expanded ? "" : year)} aria-expanded={expanded} className="focus-ring grid w-full grid-cols-[1fr_repeat(3,auto)_auto] items-center gap-2 border-b px-1.5 py-2 text-left hover:bg-slate-50" style={{ borderColor: "#EEF1F5" }}>
                                  <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#354A66" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: expanded ? "rotate(90deg)" : "none" }}><path d="m9 18 6-6-6-6" /></svg>{year.replace("-", "–")}</span>
                                  <span className="text-[9px] tabular-nums" style={{ color: "#61718A" }}>{currency(collection.expected)}</span>
                                  <span className="text-[9px] tabular-nums" style={{ color: "#087E63" }}>{currency(collection.paid)}</span>
                                  <span className="text-[9px] tabular-nums" style={{ color: collection.due ? "#B56D20" : "#8793A4" }}>{currency(collection.due)}</span>
                                  <span className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold" style={{ color: collection.status === "Paid" ? "#087E63" : collection.status === "Due" ? "#A85C12" : "#9A6A21", backgroundColor: collection.status === "Paid" ? "#E8F5EF" : "#FFF3E5" }}>{collection.status}</span>
                                </button>
                              </td>
                            </tr>
                            {expanded && (
                              <tr key={`${year}-months`}>
                                <td colSpan={5} className="px-1.5 pb-2 pt-1">
                                  <table className="w-full border-collapse">
                                    <thead><tr>{["Month", "Expected", "Paid", "Due", "Status"].map((label) => <th key={label} className="px-1.5 py-1.5 text-left text-[8px] font-medium" style={{ color: "#929EAE" }}>{label}</th>)}</tr></thead>
                                    <tbody>{collection.months.map((month) => (
                                      <tr key={month.month} className="border-t" style={{ borderColor: "#F0F3F7" }}>
                                        <td className="px-1.5 py-1.5 text-[9px]" style={{ color: "#56677F" }}>{month.month}</td>
                                        <td className="px-1.5 py-1.5 text-[9px] tabular-nums" style={{ color: "#77869A" }}>{currency(month.expected)}</td>
                                        <td className="px-1.5 py-1.5 text-[9px] tabular-nums" style={{ color: "#087E63" }}>{currency(month.paid)}</td>
                                        <td className="px-1.5 py-1.5 text-[9px] tabular-nums" style={{ color: month.due ? "#A85C12" : "#8793A4" }}>{currency(month.due)}</td>
                                        <td className="px-1.5 py-1.5 text-[9px]" style={{ color: month.status === "Paid" ? "#087E63" : "#A85C12" }}>{month.status}</td>
                                      </tr>
                                    ))}</tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "#EEF4FF", color: "#2457D6" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 8v6m3-3h-6"/></svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#344963" }}>No members yet</p>
              <p className="mt-1 text-xs" style={{ color: "#8793A4" }}>Add a member or import your register to get started.</p>
              <button type="button" onClick={openCreateForm} className="focus-ring mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "#2457D6" }}>Add Member</button>
            </div>
          )}
        </aside>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <form onSubmit={saveMember} className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl" aria-labelledby="member-form-title" aria-modal="true" role="dialog">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 id="member-form-title" className="font-display text-lg font-semibold" style={{ color: "#1B304C" }}>{editingMember ? "Edit member" : "Add member"}</h3>
                <p className="mt-1 text-xs" style={{ color: "#8793A4" }}>Member details are saved to this register session.</p>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Close form" className="rounded p-1 text-xl leading-none" style={{ color: "#7D8A9D" }}>×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { name: "name", label: "Full name", required: true },
                { name: "phone", label: "Phone", required: true },
                { name: "hometown", label: "City", required: true },
                { name: "joinDate", label: "Join date", required: true },
                { name: "address", label: "Address", required: true, wide: true },
              ] as const).map((field) => (
                <label key={field.name} className={field.name === "address" ? "col-span-2" : ""}>
                  <span className="mb-1.5 block text-[11px] font-medium" style={{ color: "#506078" }}>{field.label}</span>
                  <input required={field.required} value={form[field.name]} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="focus-ring w-full rounded-lg border px-3 py-2.5 text-xs outline-none" style={{ borderColor: "#DDE5EF", color: "#243752" }} />
                </label>
              ))}
              <label>
                <span className="mb-1.5 block text-[11px] font-medium" style={{ color: "#506078" }}>Status</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MemberStatus }))} className="focus-ring w-full rounded-lg border bg-white px-3 py-2.5 text-xs outline-none" style={{ borderColor: "#DDE5EF", color: "#243752" }}>
                  <option>Active</option><option>Pending</option><option>Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "#EEF1F5" }}>
              <button type="button" onClick={() => setFormOpen(false)} className="focus-ring rounded-lg border px-3.5 py-2 text-xs font-semibold" style={{ borderColor: "#DDE5EF", color: "#56677F" }}>Cancel</button>
              <button type="submit" className="focus-ring rounded-lg px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "#2457D6" }}>{editingMember ? "Save changes" : "Add member"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}