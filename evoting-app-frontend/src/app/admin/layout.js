"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const NAV = [
  { section: "Election Management", items: [
    { label: "Dashboard", href: "/admin", icon: "◉" },
    { label: "Candidates", href: "/admin/candidates", icon: "◈" },
    { label: "Stations", href: "/admin/stations", icon: "⌂" },
    { label: "Positions", href: "/admin/positions", icon: "⊞" },
    { label: "Polls", href: "/admin/polls", icon: "☐" },
  ]},
  { section: "People", items: [
    { label: "Voters", href: "/admin/voters", icon: "⊕" },
    { label: "Admins", href: "/admin/admins", icon: "⊛" },
  ]},
  { section: "Reports", items: [
    { label: "Results", href: "/admin/results", icon: "▣" },
    { label: "Statistics", href: "/admin/statistics", icon: "◧" },
    { label: "Audit Log", href: "/admin/audit", icon: "☰" },
  ]},
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role === "voter")) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/logo.png" alt="Logo" />
          <span>Electoral Commission</span>
        </div>
        <div className="topbar-right">
          <div className="topbar-user">
            <strong>{user.full_name}</strong>
            <br />
            <span style={{ fontSize: "0.75rem", color: "var(--gold-light)" }}>{user.role?.replace("_", " ").toUpperCase()}</span>
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: "var(--gray-400)", borderColor: "var(--gray-600)" }} onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <aside className="sidebar">
        {NAV.map((group) => (
          <div className="sidebar-section" key={group.section}>
            <div className="sidebar-section-title">{group.section}</div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`}>
                <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <main className="main-content">{children}</main>
    </>
  );
}
