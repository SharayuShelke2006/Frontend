import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import TelanganaMap from '@/components/map/TelanganaMap';
import RiskBadge from '@/components/shared/RiskBadge';
import type { RiskLevel } from '@/types/contract';

const RISK_LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function GisOverview() {
  const navigate = useNavigate();
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | null>(null);
  const [search, setSearch] = useState('');

  const districts = useMemo(() => {
    const list = districtsGeojson?.features.map((f) => f.properties) ?? [];
    return list
      .filter((d) => !riskFilter || d.risk_level === riskFilter)
      .filter((d) => d.district_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.risk_score - a.risk_score);
  }, [districtsGeojson, riskFilter, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-navy-900">Telangana GIS Overview</h1>
          <p className="text-xs text-slate-500">
            Real district boundaries · click a district to drill down into area and ATM-level risk
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district…"
            className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-accent-500 sm:flex-none"
          />
          <select
            value={riskFilter ?? ''}
            onChange={(e) => setRiskFilter((e.target.value || null) as RiskLevel | null)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-accent-500"
          >
            <option value="">All Risk Levels</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-64 min-h-0 shrink-0 lg:h-auto lg:flex-1">
          <TelanganaMap riskFilter={riskFilter} />
        </div>
        <div className="w-full min-h-0 flex-1 overflow-y-auto border-t border-slate-200 bg-white lg:w-80 lg:flex-none lg:border-l lg:border-t-0">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Districts ({districts.length})
          </div>
          {districts.map((d) => (
            <button
              key={d.district_id}
              onClick={() => navigate(`/gis/districts/${d.district_id}`)}
              className="flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy-900">{d.district_name}</span>
                <RiskBadge level={d.risk_level} score={d.risk_score} />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>{d.atm_total} ATMs</span>
                <span>{d.high_risk_atm_count} high-risk</span>
                {d.district_highlight && (
                  <span className="font-semibold text-red-600">
                    Above threshold ({d.highlight_threshold})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
