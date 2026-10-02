interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "members",
    label: "Members",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "year-wise-list",
    label: "Year Wise List",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "expenses-collection",
    label: "Expenses & Collection",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20m5-16H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeNav, onNavChange, collapsed, onToggle }: SidebarProps) {
  return (
    <div
      className="relative flex flex-col h-full transition-all duration-300 ease-in-out shrink-0"
      style={{
        width: collapsed ? "72px" : "240px",
        backgroundColor: "#0F172A",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[84px] z-10 w-6 h-6 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors focus-ring"
        style={{ color: "#0F172A" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }}
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", height: "72px" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#2563EB" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-base tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap" }}>
            E-Register
          </span>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <p className="px-5 pt-6 pb-2 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.6)" }}>
          Main Menu
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 pt-2 space-y-1 overflow-y-auto" aria-label="Main menu">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className="nav-item focus-ring w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left"
              style={{
                backgroundColor: isActive ? "#2563EB" : "transparent",
                color: isActive ? "#ffffff" : "rgba(148,163,184,0.9)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
