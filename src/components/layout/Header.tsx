import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import type { Role } from '@/types/contract';
import { formatIstTime } from '@/lib/selectors';
import { ROLE_HOME } from './RoleRoute';

const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: 'Citizen / Victim',
  LEA: 'LEA Officer',
  BANK: 'Bank / FI Officer',
  I4C: 'I4C Coordinator',
};

export default function Header() {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const lastUpdated = useStore((s) => s.lastUpdated);
  const notifications = useStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read && n.recipient_role === role).length;
  const navigate = useNavigate();

  function handleRoleChange(next: Role) {
    setRole(next);
    navigate(ROLE_HOME[next]);
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-navy-950 px-6 text-white">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-accent-600 text-sm font-bold tracking-tight">
            N
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-wide">NIRIKSHAK</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-300">
              Predictive Cybercrime Intelligence
            </div>
          </div>
        </Link>
        <span className="badge border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> System Online
        </span>
        <span className="badge border border-amber-400/40 bg-amber-400/10 text-amber-300">
          Demo / Simulated Data
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-300">Last updated {formatIstTime(lastUpdated)} IST</span>
        <Link to="/notifications" className="relative rounded p-2 hover:bg-white/10" aria-label="Notifications">
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
              {unread}
            </span>
          )}
        </Link>
        <label className="flex items-center gap-2 rounded border border-white/15 bg-white/5 px-2 py-1">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">Role</span>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="bg-transparent text-sm font-medium text-white outline-none"
          >
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r} className="text-navy-950">
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
