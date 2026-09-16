import { useParams, useNavigate } from 'react-router-dom';
import { useCaseBundle } from '@/lib/selectors';
import { formatCurrency, formatIstTime } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const bundle = useCaseBundle(caseId);

  if (!bundle) {
    return <div className="p-6 text-sm text-slate-500">Case not found.</div>;
  }
  const { case: c, predictions, alerts, actions } = bundle;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] text-slate-400">Case {c.case_id} · Complaint {c.complaint_id}</div>
          <h1 className="text-xl font-bold text-navy-900">{c.crime_category.replaceAll('_', ' ')}</h1>
          <p className="text-sm text-slate-500">Reported {formatIstTime(c.reporting_timestamp)}</p>
        </div>
        <span className="badge badge-medium">{c.status.replaceAll('_', ' ')}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Complaint Summary</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Victim" value={c.victim.display_name} />
            <Row label="Contact" value={c.victim.contact_masked} />
            <Row label="Reported Amount" value={formatCurrency(c.reported_amount)} />
            <Row label="Victim Account" value={c.known_financial_context.victim_account_masked} />
            <Row label="Bank" value={c.known_financial_context.bank_name} />
          </dl>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Assigned LEA</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Unit" value={c.assigned_lea.unit_name} />
            <Row label="Unit ID" value={c.assigned_lea.unit_id} />
          </dl>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <h3 className="mb-1 text-[11px] font-semibold uppercase text-slate-400">Case Status Timeline</h3>
            <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
              {['RECEIVED', 'UNDER_INVESTIGATION', 'FINANCIAL_INTELLIGENCE_PROCESSING', 'ACTION_INITIATED', 'RESOLVED'].map(
                (s) => (
                  <span key={s} className={`badge ${s === c.status ? 'badge-critical' : 'badge-low'}`}>
                    {s.replaceAll('_', ' ')}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="panel mt-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Predictions</h2>
        {predictions.length === 0 && <p className="text-sm text-slate-400">No active predictions for this case.</p>}
        <ul className="divide-y divide-slate-100">
          {predictions.map((p) => (
            <li key={p.prediction_id}>
              <button
                onClick={() => navigate(`/predictions/${p.prediction_id}`)}
                className="flex w-full items-center justify-between py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm text-navy-900">
                  {p.predicted_cashout.district_name}
                  {p.predicted_cashout.area_name && ` / ${p.predicted_cashout.area_name}`}
                </span>
                <RiskBadge level={p.risk.level} score={p.risk.score} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Alerts</h2>
        {alerts.length === 0 && <p className="text-sm text-slate-400">No alerts generated for this case.</p>}
        <ul className="divide-y divide-slate-100">
          {alerts.map((a) => (
            <li key={a.alert_id}>
              <button
                onClick={() => navigate(`/alerts/${a.alert_id}`)}
                className="flex w-full items-center justify-between py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm text-navy-900">{a.alert_id}</span>
                <span className="text-xs text-slate-500">{a.status.replaceAll('_', ' ')}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {actions.length > 0 && (
        <section className="panel mt-4 p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Investigation Actions</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {actions.map((a) => (
              <li key={a.action_id}>
                {formatIstTime(a.created_at)} — {a.action_type.replaceAll('_', ' ')}: {a.notes}
              </li>
            ))}
          </ul>
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
