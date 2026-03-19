"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const NAV = [
  { label: "Dashboard", href: "/voter", icon: "◉" },
  { label: "Open Polls", href: "/voter/polls", icon: "☐" },
  { label: "Cast Vote", href: "/voter/vote", icon: "✓" },
  { label: "My History", href: "/voter/history", icon: "☰" },
  { label: "Results", href: "/voter/results", icon: "▣" },
  { label: "My Profile", href: "/voter/profile", icon: "◈" },
];

export default function VoterLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "voter")) router.push("/login");
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
            <strong>{user.full_name}</strong><br />
            <span style={{ fontSize: "0.75rem", color: "var(--gold-light)", fontFamily: "monospace", letterSpacing: "0.08em" }}>{user.voter_card_number}</span>
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: "var(--gray-400)", borderColor: "var(--gray-600)" }} onClick={logout}>Logout</button>
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Voter Menu</div>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`}>
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </>
  );
}
