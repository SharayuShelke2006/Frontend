import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import type { Role } from '@/types/contract';

const ROLES: { role: Role; title: string; desc: string }[] = [
  { role: 'I4C', title: 'I4C Coordinator', desc: 'State/national coordination, cross-jurisdiction visibility.' },
  { role: 'LEA', title: 'LEA Officer', desc: 'Case investigation, GIS drill-down, alerts and action recording.' },
  { role: 'BANK', title: 'Bank / FI Officer', desc: 'Receive alerts, review affected accounts, record response.' },
  { role: 'CITIZEN', title: 'Citizen / Victim', desc: 'Submit a complaint and track non-sensitive case status.' },
];

export default function RoleSelect() {
  const setRole = useStore((s) => s.setRole);
  const navigate = useNavigate();

  function choose(role: Role) {
    setRole(role);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-600 text-xl font-bold">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-wide">NIRIKSHAK</h1>
          <p className="mt-1 text-sm text-slate-300">
            Predictive Cybercrime Intelligence System · SIH26184 · Secure Role-Based Access
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => choose(r.role)}
              className="panel px-5 py-4 text-left transition-shadow hover:shadow-lg"
            >
              <div className="text-base font-semibold text-navy-900">{r.title}</div>
              <div className="mt-1 text-xs text-slate-500">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
