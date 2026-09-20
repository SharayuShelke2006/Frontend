import { useMemo, useState } from 'react';
import { useStore } from '@/state/store';
import { useIntelligenceDrawer } from '@/components/shared/IntelligenceDrawer';
import RiskBadge from '@/components/shared/RiskBadge';
import { formatCurrency, formatIstTime } from '@/lib/selectors';
import type { RiskLevel } from '@/types/contract';

const RISK_LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function PredictionQueue() {
  const predictions = useStore((s) => s.predictions);
  const atmsById = useStore((s) => s.atmsById);
  const { open } = useIntelligenceDrawer();
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [query, setQuery] = useState('');

  const ranked = useMemo(() => predictions
    .filter((prediction) => !riskFilter || prediction.risk.level === riskFilter)
    .filter((prediction) => {
      const atm = atmsById.get(prediction.predicted_cashout.atm_id);
      const haystack = `${prediction.prediction_id} ${prediction.predicted_cashout.district_name} ${atm?.bank_name ?? ''}`.toLowerCase();
      return !query.trim() || haystack.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => b.risk.score - a.risk.score), [atmsById, predictions, query, riskFilter]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-600">Forecast intelligence</p>
          <h1 className="mt-1 text-lg font-bold text-navy-900">Predicted Withdrawal Locations</h1>
          <p className="text-xs text-slate-500">Ranked probabilistic forecasts for coordinated human review · {ranked.length} visible</p>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID / district / bank" className="w-56 rounded border border-slate-300 px-3 py-1.5 text-sm" />
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskLevel | '')} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">All risk</option>
            {RISK_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[48px_minmax(180px,1fr)_110px_110px_140px_130px_100px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <span>#</span><span>Predicted location</span><span>Risk</span><span>Probability</span><span>Amount at risk</span><span>Window</span><span>Status</span>
        </div>
        {ranked.map((prediction, index) => {
          const cashout = prediction.predicted_cashout;
          const atm = atmsById.get(cashout.atm_id);
          const probability = Math.round((prediction.supporting_intelligence.supporting_path_count / Math.max(1, prediction.supporting_intelligence.supporting_path_count + 1)) * 100);
          return (
            <button key={prediction.prediction_id} onClick={() => open({ type: 'prediction', id: prediction.prediction_id })} className="grid w-full grid-cols-[48px_minmax(180px,1fr)_110px_110px_140px_130px_100px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50">
              <span className="text-sm font-bold text-slate-400">{index + 1}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-navy-900">{atm?.bank_name ?? 'ATM'} · {cashout.atm_id}</span><span className="block truncate text-xs text-slate-500">{cashout.district_name}{cashout.area_name ? ` / ${cashout.area_name}` : ''}</span></span>
              <RiskBadge level={prediction.risk.level} score={prediction.risk.score} />
              <span className="text-sm font-semibold text-navy-900">{probability}%</span>
              <span className="text-sm text-slate-600">{formatCurrency(prediction.supporting_intelligence.last_observed_transaction.amount)}</span>
              <span className="text-xs text-slate-500">{formatIstTime(cashout.withdrawal_window.start)}</span>
              <span className="badge badge-medium justify-self-start">{prediction.status}</span>
            </button>
          );
        })}
        {ranked.length === 0 && <div className="px-4 py-10 text-center text-sm text-slate-400">No matching intelligence found for the selected filters.</div>}
      </div>
    </div>
  );
}
