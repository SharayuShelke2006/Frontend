import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAtmBundle } from '@/lib/selectors';
import { formatCurrency, formatIstTime } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';

export default function AtmDetail() {
  const { atmId } = useParams();
  const navigate = useNavigate();
  const bundle = useAtmBundle(atmId);

  if (!bundle) {
    return <div className="p-6 text-sm text-slate-500">ATM not found.</div>;
  }

  const { atm, withdrawals, predictions, alerts } = bundle;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 text-[11px] text-slate-400">
        <Link to={`/gis/districts/${atm.district_id}`} className="hover:underline">
          {atm.district_name}
        </Link>
        {atm.area_name && <> / {atm.area_name}</>} / {atm.atm_id}
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">{atm.name}</h1>
          <p className="text-sm text-slate-500">{atm.address}</p>
        </div>
        <RiskBadge level={atm.risk.risk_level} score={atm.risk.risk_score} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Location */}
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Location</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Bank" value={atm.bank_name} />
            <Row label="ATM ID" value={atm.atm_id} />
            <Row label="Coordinates" value={`${atm.lat.toFixed(6)}, ${atm.lon.toFixed(6)}`} />
            <Row label="District" value={atm.district_name} />
            <Row label="Area" value={atm.area_name ?? '—'} />
          </dl>
          <a
            href={atm.map_links.google_maps}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-medium text-accent-600 hover:underline"
          >
            Open in Google Maps →
          </a>
        </section>

        {/* Risk */}
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Risk</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Risk Score" value={atm.risk.risk_score.toFixed(2)} />
            <Row label="Risk Level" value={atm.risk.risk_level} />
            <Row label="Rank in District" value={`#${atm.risk.rank_in_district}`} />
            {atm.risk.predicted_withdrawal_window && (
              <Row
                label="Predicted Window"
                value={`${formatIstTime(atm.risk.predicted_withdrawal_window.start)} – ${formatIstTime(
                  atm.risk.predicted_withdrawal_window.end,
                )}`}
              />
            )}
          </dl>
          {!atm.risk.predicted_withdrawal_window && (
            <p className="mt-2 text-xs text-slate-400">No active predicted withdrawal window.</p>
          )}
        </section>

        {/* Intelligence */}
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Intelligence</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Active Predictions" value={String(atm.related.active_prediction_count)} />
            <Row label="Related Cases" value={String(atm.related.related_case_count)} />
            <Row label="High-Risk Paths" value={String(atm.related.high_risk_path_count)} />
          </dl>
          {predictions.length > 0 && (
            <button
              onClick={() => navigate(`/predictions/${predictions[0].prediction_id}`)}
              className="mt-3 rounded bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-500"
            >
              View Prediction Detail
            </button>
          )}
        </section>
      </div>

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
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value}</dd>
    </div>
  );
}
