import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { ROLE_HOME } from '@/components/layout/RoleRoute';
import type { Role } from '@/types/contract';

const OFFICIAL_ROLES: { role: Role; label: string }[] = [
  { role: 'LEA', label: 'LEA Officer' },
  { role: 'I4C', label: 'I4C Coordinator' },
  { role: 'BANK', label: 'Bank / FI Officer' },
];

function EmblemMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#ffffff" stroke="#0a1628" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#0b5fa5" strokeWidth="1.2" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * Math.PI) / 8;
        const x1 = 20 + Math.cos(angle) * 8;
        const y1 = 20 + Math.sin(angle) * 8;
        const x2 = 20 + Math.cos(angle) * 14;
        const y2 = 20 + Math.sin(angle) * 14;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0b5fa5" strokeWidth="1" />;
      })}
      <circle cx="20" cy="20" r="6" fill="#0a1628" />
      <text x="20" y="24" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff">
        N
      </text>
    </svg>
  );
}

export default function PortalChrome({ children }: { children: ReactNode }) {
  const setRole = useStore((s) => s.setRole);
  const navigate = useNavigate();

  function exitToOps(role: Role) {
    setRole(role);
    navigate(ROLE_HOME[role]);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Utility bar */}
      <div className="flex h-8 items-center justify-between bg-navy-950 px-4 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-2 w-3.5 bg-gradient-to-b from-orange-500 via-white to-green-600" />
          <span>Government of Telangana (Prototype) · Ministry-style Citizen Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Viewing as: Citizen</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Switch to:</span>
          {OFFICIAL_ROLES.map((r) => (
            <button key={r.role} onClick={() => exitToOps(r.role)} className="text-slate-300 hover:text-white hover:underline">
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <EmblemMark />
          <div className="leading-tight">
            <div className="text-lg font-bold text-navy-950">NIRIKSHAK</div>
            <div className="text-[11px] font-medium text-slate-500">
              Citizen Cybercrime Reporting Portal · SIH 2026 Prototype
            </div>
          </div>
          <span className="ml-auto badge border border-amber-300 bg-amber-50 text-amber-700">Demo / Simulated Data</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="motion-citizen-navbar bg-accent-600">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 text-sm font-medium text-white">
          <Link to="/citizen" className="motion-nav-link px-3 py-2.5 hover:bg-white/10">
            Home
          </Link>
          <Link to="/citizen/complaint" className="motion-nav-link px-3 py-2.5 hover:bg-white/10">
            Register a Complaint
          </Link>
          <Link to="/citizen/track" className="motion-nav-link px-3 py-2.5 hover:bg-white/10">
            Track your Complaint
          </Link>
          <span className="cursor-not-allowed px-3 py-2.5 text-white/50">Learning Corner</span>
          <span className="cursor-not-allowed px-3 py-2.5 text-white/50">Contact Us</span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
