import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import { useAtmBundle } from '@/lib/selectors';
import { formatCurrency, formatIstTime } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';
import AtmRiskProfile from '@/components/shared/AtmRiskProfile';

export default function AtmDetail() {
  const { atmId } = useParams();
  const navigate = useNavigate();
  const bundle = useAtmBundle(atmId);
  const lastUpdated = useStore((s) => s.lastUpdated);

  if (!bundle) {
    return <div className="p-6 text-sm text-slate-500">ATM not found.</div>;
  }

  const { atm, withdrawals, predictions, alerts } = bundle;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
            <Link
              to={`/gis/districts/${atm.district_id}`}
              className="text-slate-700 transition-all duration-200 hover:text-accent-700 hover:scale-[1.03]"
            >
              {atm.district_name}
            </Link>
            {atm.area_name && (
              <>
                <span className="text-base text-slate-400 transition-transform duration-200 hover:translate-x-0.5">&gt;</span>
                <span className="font-medium text-slate-700 transition-all duration-200 hover:text-accent-700 hover:scale-[1.02]">{atm.area_name}</span>
              </>
            )}
            <span className="text-base text-slate-400 transition-transform duration-200 hover:translate-x-0.5">&gt;</span>
            <span className="font-bold text-navy-900 transition-all duration-200 hover:text-accent-700 hover:scale-[1.02]">{atm.atm_id}</span>
          </div>
          <h1 className="text-lg font-bold text-navy-900">{atm.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-4">
          <RiskBadge level={atm.risk.risk_level} score={atm.risk.risk_score} />
          <a href={atm.map_links.google_maps} target="_blank" rel="noreferrer" className="font-medium text-accent-600 hover:underline">
            Open in Google Maps →
          </a>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <AtmRiskProfile atm={atm} withdrawals={withdrawals} lastUpdated={lastUpdated} />

        {predictions.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => navigate(`/predictions/${predictions[0].prediction_id}`)}
              className="rounded bg-accent-600 px-3 py-2 text-xs font-semibold text-white hover:bg-accent-500"
            >
              View Prediction Detail
            </button>
          </div>
        )}

        {alerts.length > 0 && (
          <section className="panel mt-4 p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Related Alerts</h2>
            <ul className="divide-y divide-slate-100">
              {alerts.map((a) => (
                <li key={a.alert_id}>
                  <button
                    onClick={() => navigate(`/alerts/${a.alert_id}`)}
                    className="flex w-full items-center justify-between py-2 text-left hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-navy-900">{a.alert_id}</span>
                    <RiskBadge level={a.severity} />
                    <span className="text-xs text-slate-500">{a.status.replaceAll('_', ' ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {withdrawals && (
          <section className="panel mt-4 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Previous Withdrawals</h2>
              <span className="text-xs text-slate-400">
                {withdrawals.withdrawal_history.summary.withdrawal_count} txns · avg{' '}
                {formatCurrency(withdrawals.withdrawal_history.summary.avg_amount)}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.withdrawal_history.records.slice(0, 30).map((r) => (
                    <tr key={r.withdrawal_id}>
                      <td className="py-1.5 text-slate-600">{formatIstTime(r.timestamp)}</td>
                      <td className="py-1.5 font-medium text-navy-900">{formatCurrency(r.amount)}</td>
                      <td className="py-1.5">
                        <span
                          className={`badge ${
                            r.status === 'FLAGGED' ? 'badge-high' : r.status === 'FAILED' ? 'badge-critical' : 'badge-low'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
