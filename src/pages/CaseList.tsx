import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { formatCurrency, formatIstTime } from '@/lib/selectors';

export default function CaseList() {
  const navigate = useNavigate();
  const cases = useStore((s) => s.cases);
  const predictionsByCase = useStore((s) => s.predictionsByCase);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">Cases</h1>
      <p className="mb-4 text-xs text-slate-500">{cases.length} complaint-driven cases</p>
      <div className="panel divide-y divide-slate-100">
        {cases.map((c) => {
          const pred = predictionsByCase.get(c.case_id)?.[0];
          return (
            <button
              key={c.case_id}
              onClick={() => navigate(`/cases/${c.case_id}`)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy-900">{c.case_id}</span>
                  <span className="text-xs text-slate-400">{c.crime_category.replaceAll('_', ' ')}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Reported {formatIstTime(c.reporting_timestamp)} · {c.assigned_lea.unit_name}
                </div>
              </div>
              <span className="text-sm font-medium text-navy-900">{formatCurrency(c.reported_amount)}</span>
              {pred && <span className="badge badge-medium">{pred.risk.level}</span>}
              <span className="badge badge-low">{c.status.replaceAll('_', ' ')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
