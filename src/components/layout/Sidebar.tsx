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
  { to: '/predictions', label: 'Predictions', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/alerts', label: 'Alerts', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/cases', label: 'Cases', roles: ['LEA', 'I4C'] },
  { to: '/notifications', label: 'Notifications', roles: ['LEA', 'I4C', 'BANK'] },
  { to: '/audit', label: 'Audit Timeline', roles: ['LEA', 'I4C', 'BANK'] },
];

export default function Sidebar() {
  const role = useStore((s) => s.role);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-3">
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
  );
}
