import { NavLink } from 'react-router-dom';
import { useStore } from '@/state/store';
import type { Role } from '@/types/contract';

interface NavItem {
  to: string;
  label: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/lea', label: 'LEA Dashboard', roles: ['LEA'] },
  { to: '/i4c', label: 'I4C Command Center', roles: ['I4C'] },
  { to: '/bank', label: 'Bank/FI Response Queue', roles: ['BANK'] },
  { to: '/gis', label: 'Telangana GIS', roles: ['LEA', 'I4C'] },
  { to: '/coordinators', label: 'District Coordinators', roles: ['LEA', 'I4C'] },
  { to: '/banks', label: 'Bank Analytics', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/predictions', label: 'Predictions', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/alerts', label: 'Alerts', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/cases', label: 'Cases', roles: ['LEA', 'I4C'] },
  { to: '/notifications', label: 'Notifications', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/audit', label: 'Audit Timeline', roles: ['LEA', 'I4C', 'BANK'] },
];

interface Props {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: Props) {
  const role = useStore((s) => s.role);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-3 lg:flex">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `motion-nav-item rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-600/10 text-accent-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {mobileOpen && (
        <>
          <div
            className="motion-drawer-backdrop fixed inset-0 z-[1700] bg-navy-950/40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <nav
            className="motion-drawer-panel fixed inset-y-0 left-0 z-[1750] flex w-64 flex-col gap-1 overflow-y-auto border-r border-slate-200 bg-white p-3 shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `motion-nav-item rounded px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-600/10 text-accent-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
