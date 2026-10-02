interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div
      className="rounded-[12px] flex flex-col items-center justify-center text-center px-6 py-20 gap-3"
      style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
      role="status"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(37,99,235,0.1)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 9h6v6H9z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
        {title}
      </h2>
      <p className="text-sm max-w-sm" style={{ color: "#94A3B8" }}>
        {description}
      </p>
    </div>
  );
}
