import { useMemo, useState } from 'react';
import { useStore } from '@/state/store';
import RiskBadge from '@/components/shared/RiskBadge';
import { useIntelligenceDrawer } from '@/components/shared/IntelligenceDrawer';
import { formatIstTime } from '@/lib/selectors';
import type { AlertStatus, RiskLevel } from '@/types/contract';

const STATUS_OPTIONS: AlertStatus[] = [
  'GENERATED',
  'DELIVERED',
  'ACKNOWLEDGED',
  'ASSIGNED',
  'ACTION_INITIATED',
  'RESOLVED',
  'EXPIRED',
  'FALSE_POSITIVE',
];
const RISK_LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function AlertQueue() {
  const { open } = useIntelligenceDrawer();
  const alerts = useStore((s) => s.alerts);
  const role = useStore((s) => s.role);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [districtFilter, setDistrictFilter] = useState('');

  const districts = useMemo(() => [...new Set(alerts.map((a) => a.target.district))].sort(), [alerts]);

  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => !statusFilter || a.status === statusFilter)
        .filter((a) => !riskFilter || a.severity === riskFilter)
        .filter((a) => !districtFilter || a.target.district === districtFilter)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [alerts, statusFilter, riskFilter, districtFilter],
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-navy-900">Alert Queue</h1>
          <p className="text-xs text-slate-500">
            Role-filtered view for {role} · {filtered.length} of {alerts.length} alerts
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | '')}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All Risk</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | '')}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel divide-y divide-slate-100">
        {filtered.map((a) => (
          <button
            key={a.alert_id}
            onClick={() => open({ type: 'alert', id: a.alert_id })}
            className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
          >
            <RiskBadge level={a.severity} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy-900">{a.alert_id}</span>
                <span className="text-xs text-slate-400">{a.target.district}{a.target.area ? ` / ${a.target.area}` : ''}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Window {formatIstTime(a.predicted_window.start)} – {formatIstTime(a.predicted_window.end)}
              </div>
            </div>
            <span className="badge badge-medium">{a.status.replaceAll('_', ' ')}</span>
          </button>
        ))}
        {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No alerts match these filters.</div>}
      </div>
    </div>
  );
}
