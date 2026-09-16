import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import { formatIstTime, timeAgo } from '@/lib/selectors';
import RiskBadge from '@/components/shared/RiskBadge';
import FundFlowPath from '@/components/shared/FundFlowPath';

export default function PredictionDetail() {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const prediction = useStore((s) => (predictionId ? s.predictionsById.get(predictionId) : undefined));
  const caseObj = useStore((s) => (prediction ? s.casesById.get(prediction.case_id) : undefined));
  const paths = useStore((s) => (predictionId ? s.pathsByPrediction.get(predictionId) ?? [] : []));
  const alert = useStore((s) => s.alerts.find((a) => a.prediction_id === predictionId));

  if (!prediction) {
    return <div className="p-6 text-sm text-slate-500">Prediction not found.</div>;
  }

  const c = prediction.predicted_cashout;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 text-[11px] text-slate-400">
        {caseObj && (
          <Link to={`/cases/${caseObj.case_id}`} className="hover:underline">
            Case {caseObj.case_id}
          </Link>
        )}{' '}
        / Prediction {prediction.prediction_id}
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Predicted Cash-out Location</h1>
          <p className="text-sm text-slate-500">
            {c.district_name}
            {c.area_name && ` / ${c.area_name}`} · not a guaranteed withdrawal — a probabilistic forecast for human
            decision-making.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={prediction.risk.level} score={prediction.risk.score} />
          <span className="badge badge-medium">status {prediction.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Where &amp; When</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Predicted ATM" value={c.atm_id} />
            <Row label="District / Area" value={`${c.district_name}${c.area_name ? ' / ' + c.area_name : ''}`} />
            <Row
              label="Likely Withdrawal Window"
              value={`${formatIstTime(c.withdrawal_window.start)} – ${formatIstTime(c.withdrawal_window.end)}`}
            />
            <Row label="Rank" value={`#${prediction.risk.rank} in district`} />
            <Row label="As Of" value={formatIstTime(prediction.as_of)} />
            <Row label="Freshness" value={`${timeAgo(prediction.generated_at)} · ${prediction.freshness_seconds}s old`} />
          </dl>
          <button
            onClick={() => navigate(`/atms/${c.atm_id}`)}
            className="mt-3 rounded bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-500"
          >
            View ATM Detail
          </button>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why This Location?</h2>
          <ul className="space-y-2">
            {prediction.supporting_intelligence.explanation_factors.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{f.label}</span>
                <span className="font-semibold text-navy-900">{f.value}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
            <Row label="Supporting Paths" value={String(prediction.supporting_intelligence.supporting_path_count)} />
            <Row label="Converging Paths" value={String(prediction.supporting_intelligence.converging_path_count)} />
            <Row
              label="Last Observed Transaction"
              value={`${formatIstTime(prediction.supporting_intelligence.last_observed_transaction.timestamp)}`}
            />
          </dl>
        </section>
      </div>

      <div className="mt-4 space-y-4">
        {paths.map((p) => (
          <FundFlowPath key={p.path_id} path={p} />
        ))}
      </div>

      {alert && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigate(`/alerts/${alert.alert_id}`)}
            className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            View Alert &amp; Take Action →
          </button>
        </div>
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
