import { useEffect, useState } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import ExpenseCollectionPage from "./components/expenses/ExpenseCollectionPage";
import MemberProfilePage from "./components/MemberProfilePage";
import MembersListPage from "./components/MembersListPage";
import YearWiseListPage from "./components/YearWiseListPage";
import { createManagedMember, initialManagedMembers, type ManagedMember, type MemberFields, type YearWiseEntryFields } from "./data/memberManagement";

function DashboardHome({ onNavigate }: { onNavigate: (nav: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">Workspace</p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Welcome to E-Register</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose a workspace to manage your member register, review yearly entries, or keep track of society expenses and collections.</p>
      </header>
      <section aria-label="Quick access" className="grid gap-4 md:grid-cols-3">
        {[
          { id: "members", title: "Members", description: "Manage member details and passbooks.", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
          { id: "year-wise-list", title: "Year Wise List", description: "Browse and add member entries by year.", icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" },
          { id: "expenses-collection", title: "Expenses & Collection", description: "Review yearly collections and period expenses.", icon: "M12 2v20m5-16H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
        ].map((item) => (
          <button key={item.id} type="button" onClick={() => onNavigate(item.id)} className="group rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-ring sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
            </span>
            <span className="mt-5 block font-display text-base font-semibold text-slate-900">{item.title}</span>
            <span className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-blue-600">Open section <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </section>
    </div>
  );
}

function DashboardApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 900);
  const [members, setMembers] = useState<ManagedMember[]>(() => {
    try {
      const savedMembers = window.localStorage.getItem("e-register.members.v1");
      if (savedMembers) {
        const parsedMembers: unknown = JSON.parse(savedMembers);
        if (Array.isArray(parsedMembers)) return parsedMembers as ManagedMember[];
      }
    } catch {
      // Fall back to the sample register if browser storage is unavailable or invalid.
    }
    return initialManagedMembers;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("e-register.members.v1", JSON.stringify(members));
    } catch {
      // The register continues to work for this session if storage is unavailable.
    }
  }, [members]);

  useEffect(() => {
    function collapseForNarrowScreen() {
      if (window.innerWidth < 760) setSidebarCollapsed(true);
    }
    window.addEventListener("resize", collapseForNarrowScreen);
    return () => window.removeEventListener("resize", collapseForNarrowScreen);
  }, []);
  const segments = location.pathname.split("/").filter(Boolean);
  const activeNav = segments[0] === "member" ? "year-wise-list" : segments[0] || "dashboard";
  const selectedMember = (segments[0] === "members" || segments[0] === "member") && segments[1]
    ? members.find((member) => member.id.toLowerCase() === decodeURIComponent(segments[1]).toLowerCase())
    : undefined;
  const pageTitle = selectedMember ? `${selectedMember.name} · Profile` : ({
    dashboard: "Dashboard",
    members: "Members",
    "year-wise-list": "Year Wise List",
    "expenses-collection": "Expenses & Collection",
  } as Record<string, string>)[activeNav] ?? "Dashboard";

  function navigateTo(nav: string) {
    navigate(nav === "members" ? "/members" : `/${nav}`);
  }

  function createMember(fields: MemberFields) {
    const sno = Math.max(0, ...members.map((member) => member.sno)) + 1;
    setMembers((current) => [...current, createManagedMember(fields, sno)]);
  }

  function createMembers(entries: YearWiseEntryFields[]) {
    setMembers((current) => {
      const firstSno = Math.max(0, ...current.map((member) => member.sno)) + 1;
      return [...current, ...entries.map((entry, index) => createManagedMember({
        name: entry.name,
        hometown: "",
        phone: "",
        joinDate: entry.joinDate,
        status: "Active",
      }, firstSno + index, entry.amount))];
    });
  }

  function updateMember(id: string, fields: MemberFields) {
    setMembers((current) => current.map((member) => member.id === id ? { ...member, ...fields, initials: fields.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") } : member));
  }

  function deleteMember(id: string) {
    setMembers((current) => current.filter((member) => member.id !== id));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div id="dashboard-sidebar" className="h-full shrink-0">
        <Sidebar activeNav={activeNav} onNavChange={navigateTo} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div id="dashboard-navbar" className="shrink-0"><TopNavbar pageTitle={pageTitle} sidebarCollapsed={sidebarCollapsed} /></div>
        <main id="main-content" className="min-h-0 flex-1 overflow-hidden bg-slate-50">
          <div className="h-full overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/members" element={<MembersListPage members={members} onCreate={createMember} onUpdate={updateMember} onDelete={deleteMember} />} />
              <Route path="/members/:memberId" element={<MemberProfilePage members={members} onUpdate={updateMember} onDelete={deleteMember} />} />
              <Route path="/year-wise-list" element={<YearWiseListPage members={members} onCreate={createMembers} />} />
              <Route path="/member/:memberId" element={<MemberProfilePage members={members} onUpdate={updateMember} onDelete={deleteMember} backToYearWise />} />
              <Route path="/dashboard" element={<DashboardHome onNavigate={navigateTo} />} />
              <Route path="/expenses-collection" element={<ExpenseCollectionPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const Router = window.desktop ? HashRouter : BrowserRouter;
  return <Router><DashboardApp /></Router>;
}
