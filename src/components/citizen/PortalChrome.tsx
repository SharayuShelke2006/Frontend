import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();

  function exitToOps(role: Role) {
    setRole(role);
    navigate(ROLE_HOME[role]);
  }

  return (
    <div className="citizen-portal min-h-screen">
      {/* Utility bar */}
      <div className="citizen-utility-bar flex h-12 items-center justify-between gap-3 px-4 text-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-3.5 shrink-0 bg-gradient-to-b from-orange-500 via-white to-green-600" />
          <span className="hidden truncate sm:inline">Government of Telangana (Prototype) · Ministry-style Citizen Portal</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-slate-600">Viewing as: Citizen</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Switch to:</span>
          {OFFICIAL_ROLES.map((r) => (
            <button key={r.role} onClick={() => exitToOps(r.role)} className="citizen-utility-link">
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="citizen-brand-header px-3 py-4 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <NirikshakLogo size={40} />
          <div className="min-w-0 leading-tight">
            <div className="citizen-wordmark truncate text-lg font-bold">NCRP</div>
            <div className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
              Citizen Cybercrime Reporting Portal · SIH 2026 Prototype
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="citizen-nav">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 text-sm font-medium text-white sm:px-4">
          <Link to="/citizen" className={`citizen-nav-link shrink-0 px-3 py-2.5 ${location.pathname === '/citizen' ? 'is-active' : ''}`}>
            Home
          </Link>
          <Link to="/citizen/complaint" className={`citizen-nav-link shrink-0 px-3 py-2.5 ${location.pathname === '/citizen/complaint' ? 'is-active' : ''}`}>
            Register a Complaint
          </Link>
          <Link to="/citizen/track" className={`citizen-nav-link shrink-0 px-3 py-2.5 ${location.pathname === '/citizen/track' ? 'is-active' : ''}`}>
            Track your Complaint
          </Link>
          <span className="citizen-nav-disabled shrink-0 px-3 py-2.5">Learning Corner</span>
          <span className="citizen-nav-disabled shrink-0 px-3 py-2.5">Contact Us</span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-3 py-7 sm:px-4">{children}</main>
    </div>
  );
}
