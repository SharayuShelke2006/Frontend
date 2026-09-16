import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import KpiCard from '@/components/shared/KpiCard';
import RiskBadge from '@/components/shared/RiskBadge';
import TelanganaMap from '@/components/map/TelanganaMap';
import AnalyticsSection from '@/components/analytics/AnalyticsSection';
import { formatIstTime } from '@/lib/selectors';

export default function I4cCommandCenter() {
  const navigate = useNavigate();
  const cases = useStore((s) => s.cases);
  const alerts = useStore((s) => s.alerts);
  const audit = useStore((s) => s.audit);
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const [query, setQuery] = useState('');

  const activeCases = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const activeAlerts = alerts.filter((a) => !['RESOLVED', 'EXPIRED', 'FALSE_POSITIVE'].includes(a.status));
  const awaitingAck = alerts.filter((a) => ['GENERATED', 'DELIVERED'].includes(a.status));
  const overdue = alerts.filter(
    (a) => ['GENERATED', 'DELIVERED', 'ACKNOWLEDGED'].includes(a.status) && new Date(a.expires_at) < new Date(),
  );

  const highlightedDistricts = useMemo(
    () => districtsGeojson?.features.filter((f) => f.properties.district_highlight).length ?? 0,
    [districtsGeojson],
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...cases.filter((c) => c.case_id.toLowerCase().includes(q) || c.complaint_id.toLowerCase().includes(q)).map((c) => ({
        type: 'Case',
        id: c.case_id,
        label: `${c.case_id} · ${c.crime_category.replaceAll('_', ' ')}`,
        go: () => navigate(`/cases/${c.case_id}`),
      })),
      ...alerts.filter((a) => a.alert_id.toLowerCase().includes(q) || a.target.atm_id.toLowerCase().includes(q)).map((a) => ({
        type: 'Alert',
        id: a.alert_id,
        label: `${a.alert_id} · ${a.target.district}`,
        go: () => navigate(`/alerts/${a.alert_id}`),
      })),
    ].slice(0, 8);
  }, [query, cases, alerts, navigate]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy-900">I4C Command Center</h1>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search case / complaint / ATM ID…"
            className="w-72 rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-accent-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute right-0 z-20 mt-1 w-72 rounded border border-slate-200 bg-white shadow-lg">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={r.go}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>{r.label}</span>
                  <span className="text-[10px] uppercase text-slate-400">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Cases" value={activeCases.length} onClick={() => navigate('/cases')} />
        <KpiCard label="Active Alerts" value={activeAlerts.length} tone="warning" onClick={() => navigate('/alerts')} />
        <KpiCard label="Highlighted Districts" value={highlightedDistricts} tone="critical" onClick={() => navigate('/gis')} />
        <KpiCard label="Awaiting Acknowledgement" value={awaitingAck.length} tone={overdue.length ? 'critical' : 'default'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel h-[460px] overflow-hidden lg:col-span-2">
          <TelanganaMap />
        </div>
        <div className="panel flex flex-col">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Coordination Status
          </div>
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {activeAlerts.slice(0, 10).map((a) => {
              const lea = a.recipients.find((r) => r.type === 'LEA');
              const bank = a.recipients.find((r) => r.type === 'BANK');
              return (
                <button
                  key={a.alert_id}
                  onClick={() => navigate(`/alerts/${a.alert_id}`)}
                  className="flex w-full flex-col gap-1 px-4 py-2 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy-900">{a.target.district}</span>
                    <RiskBadge level={a.severity} />
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className={`badge ${lea?.status === 'ACKNOWLEDGED' ? 'badge-low' : 'badge-medium'}`}>
                      LEA {lea?.status}
                    </span>
                    <span className={`badge ${bank?.status === 'ACKNOWLEDGED' ? 'badge-low' : 'badge-medium'}`}>
                      Bank {bank?.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel mt-4">
        <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent Activity
        </div>
        <div className="divide-y divide-slate-100">
          {audit.slice(0, 8).map((e) => (
            <div key={e.event_id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-slate-600">{e.summary}</span>
              <span className="text-[11px] text-slate-400">{formatIstTime(e.timestamp)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-right">
          <button onClick={() => navigate('/audit')} className="text-xs font-medium text-accent-600 hover:underline">
            View full audit timeline →
          </button>
        </div>
      </div>

      <AnalyticsSection />
    </div>
  );
}
