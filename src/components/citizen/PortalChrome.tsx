import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { ROLE_HOME } from '@/components/layout/RoleRoute';
import type { Role } from '@/types/contract';
import NirikshakLogo from '@/components/shared/NirikshakLogo';

const OFFICIAL_ROLES: { role: Role; label: string }[] = [
  { role: 'LEA', label: 'LEA Officer' },
  { role: 'I4C', label: 'I4C Coordinator' },
  { role: 'BANK', label: 'Bank / FI Officer' },
];

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
      <div className="flex h-8 items-center justify-between gap-2 bg-navy-950 px-3 text-[11px] text-slate-300 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-3.5 shrink-0 bg-gradient-to-b from-orange-500 via-white to-green-600" />
          <span className="hidden truncate sm:inline">Government of Telangana (Prototype) · Ministry-style Citizen Portal</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
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
      <div className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <NirikshakLogo size={40} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-lg font-bold text-navy-950">NIRIKSHAK</div>
            <div className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
              Citizen Cybercrime Reporting Portal · SIH 2026 Prototype
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="motion-citizen-navbar bg-accent-600">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 text-sm font-medium text-white sm:px-4">
          <Link to="/citizen" className="motion-nav-link shrink-0 px-3 py-2.5 hover:bg-white/10">
            Home
          </Link>
          <Link to="/citizen/complaint" className="motion-nav-link shrink-0 px-3 py-2.5 hover:bg-white/10">
            Register a Complaint
          </Link>
          <Link to="/citizen/track" className="motion-nav-link shrink-0 px-3 py-2.5 hover:bg-white/10">
            Track your Complaint
          </Link>
          <span className="shrink-0 cursor-not-allowed px-3 py-2.5 text-white/50">Learning Corner</span>
          <span className="shrink-0 cursor-not-allowed px-3 py-2.5 text-white/50">Contact Us</span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4">{children}</main>
    </div>
  );
}
