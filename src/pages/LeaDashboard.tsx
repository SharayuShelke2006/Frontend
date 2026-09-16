import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import KpiCard from '@/components/shared/KpiCard';
import RiskBadge from '@/components/shared/RiskBadge';
import TelanganaMap from '@/components/map/TelanganaMap';
import AnalyticsSection from '@/components/analytics/AnalyticsSection';
import { formatIstTime } from '@/lib/selectors';

export default function LeaDashboard() {
  const navigate = useNavigate();
  const cases = useStore((s) => s.cases);
  const predictions = useStore((s) => s.predictions);
  const alerts = useStore((s) => s.alerts);
  const actions = useStore((s) => s.actions);

  const activeCases = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const highRiskPredictions = predictions.filter((p) => p.risk.level === 'HIGH' || p.risk.level === 'CRITICAL');
  const activeAlerts = alerts.filter((a) => !['RESOLVED', 'EXPIRED', 'FALSE_POSITIVE'].includes(a.status));
  const pendingActions = alerts.filter((a) => ['ACKNOWLEDGED', 'ASSIGNED'].includes(a.status));
  const inProgressActions = actions.filter((a) => a.status === 'IN_PROGRESS');

  const recentAlerts = useMemo(
    () => [...alerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [alerts],
  );

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-bold text-navy-900">LEA Investigation Dashboard</h1>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Cases" value={activeCases.length} onClick={() => navigate('/cases')} />
        <KpiCard label="High-Risk Predictions" value={highRiskPredictions.length} tone="critical" />
        <KpiCard label="Active Alerts" value={activeAlerts.length} tone="warning" onClick={() => navigate('/alerts')} />
        <KpiCard label="Actions In Progress" value={inProgressActions.length} tone="good" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel h-[420px] overflow-hidden lg:col-span-2">
          <TelanganaMap />
        </div>
        <div className="panel flex flex-col">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent Alerts
          </div>
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {recentAlerts.map((a) => (
              <button
                key={a.alert_id}
                onClick={() => navigate(`/alerts/${a.alert_id}`)}
                className="flex w-full flex-col gap-1 px-4 py-2 text-left hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-900">{a.target.district}</span>
                  <RiskBadge level={a.severity} />
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatIstTime(a.created_at)} · {a.status.replaceAll('_', ' ')}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 px-4 py-2 text-right">
            <button onClick={() => navigate('/alerts')} className="text-xs font-medium text-accent-600 hover:underline">
              View all alerts →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="panel">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pending Actions
          </div>
          <div className="divide-y divide-slate-100">
            {pendingActions.slice(0, 8).map((a) => (
              <button
                key={a.alert_id}
                onClick={() => navigate(`/alerts/${a.alert_id}`)}
                className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm text-navy-900">
                  {a.alert_id} · {a.target.district}
                  {a.target.area ? ` / ${a.target.area}` : ''}
                </span>
                <span className="badge badge-medium">{a.status.replaceAll('_', ' ')}</span>
              </button>
            ))}
            {pendingActions.length === 0 && (
              <div className="px-4 py-4 text-sm text-slate-400">No pending actions.</div>
            )}
          </div>
        </div>
      </div>

      <AnalyticsSection />
    </div>
  );
}
