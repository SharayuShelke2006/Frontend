import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import type { Role } from '@/types/contract';
import { formatIstTime } from '@/lib/selectors';
import { ROLE_HOME } from './RoleRoute';
import NirikshakLogo from '@/components/shared/NirikshakLogo';

const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: 'Citizen / Victim',
  LEA: 'LEA Officer',
  BANK: 'Bank / FI Officer',
  I4C: 'I4C Coordinator',
};

interface Props {
  scrolled?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ scrolled = false, onToggleSidebar }: Props) {
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
    <header className={`motion-navbar sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-navy-950 px-3 text-white sm:px-6 ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="motion-icon-button rounded p-2 hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
          >
            <MenuIcon />
          </button>
        )}
        <Link to="/" className="motion-interactive flex min-w-0 items-center gap-2">
          <NirikshakLogo size={36} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[15px] font-bold tracking-wide">NIRIKSHAK</div>
            <div className="hidden truncate text-[10px] uppercase tracking-wider text-slate-300 sm:block">
              Predictive Cybercrime Intelligence
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 text-sm sm:gap-4">
        <span className="hidden text-slate-300 sm:inline">Last updated {formatIstTime(lastUpdated)} IST</span>
        <Link to="/notifications" className="motion-icon-button relative rounded p-2 hover:bg-white/10" aria-label="Notifications">
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
              {unread}
            </span>
          )}
        </Link>
        <label className="flex items-center gap-2 rounded border border-white/15 bg-white/5 px-2 py-1">
          <span className="hidden text-[11px] uppercase tracking-wide text-slate-400 sm:inline">Role</span>
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

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
