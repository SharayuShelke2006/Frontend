import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import RiskBadge from '@/components/shared/RiskBadge';
import KpiCard from '@/components/shared/KpiCard';
import { formatIstTime } from '@/lib/selectors';

export default function BankQueue() {
  const navigate = useNavigate();
  const alerts = useStore((s) => s.alerts);
  const atmsById = useStore((s) => s.atmsById);

  const bankAlerts = useMemo(
    () =>
      alerts
        .filter((a) => a.recipients.some((r) => r.type === 'BANK'))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [alerts],
  );

  const pending = bankAlerts.filter((a) => {
    const bank = a.recipients.find((r) => r.type === 'BANK');
    return bank?.status !== 'ACKNOWLEDGED';
  });

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">Bank / FI Response Queue</h1>
      <p className="mb-4 text-xs text-slate-500">
        Predicted cash-out alerts relevant to your institution's accounts and ATMs.
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Incoming Alerts" value={bankAlerts.length} />
        <KpiCard label="Pending Acknowledgement" value={pending.length} tone="warning" />
        <KpiCard label="Acknowledged" value={bankAlerts.length - pending.length} tone="good" />
      </div>

      <div className="panel divide-y divide-slate-100">
        {bankAlerts.map((a) => {
          const bank = a.recipients.find((r) => r.type === 'BANK');
          const atm = atmsById.get(a.target.atm_id);
          return (
            <button
              key={a.alert_id}
              onClick={() => navigate(`/alerts/${a.alert_id}`)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
            >
              <RiskBadge level={a.severity} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-navy-900">
                  {atm?.bank_name ?? 'Bank'} · {a.target.district}
                  {a.target.area ? ` / ${a.target.area}` : ''}
                </div>
                <div className="text-[11px] text-slate-400">
                  Window {formatIstTime(a.predicted_window.start)} – {formatIstTime(a.predicted_window.end)}
                </div>
              </div>
              <span className={`badge ${bank?.status === 'ACKNOWLEDGED' ? 'badge-low' : 'badge-medium'}`}>
                {bank?.status}
              </span>
            </button>
          );
        })}
        {bankAlerts.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No incoming alerts.</div>}
      </div>
    </div>
  );
}
