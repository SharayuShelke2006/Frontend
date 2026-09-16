import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import DistrictMap from '@/components/map/DistrictMap';
import RiskBadge from '@/components/shared/RiskBadge';
import type { Atm } from '@/types/contract';

export default function DistrictDrilldown() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const areasGeojson = useStore((s) => s.areasGeojson);
  const atms = useStore((s) => s.atms);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const districtFeature = useMemo(
    () => districtsGeojson?.features.find((f) => f.properties.district_id === districtId),
    [districtsGeojson, districtId],
  );

  const districtAreas = useMemo(
    () => areasGeojson?.features.filter((f) => f.properties.district_id === districtId) ?? [],
    [areasGeojson, districtId],
  );

  const districtAtms = useMemo(
    () => atms.filter((a) => a.district_id === districtId),
    [atms, districtId],
  );

  const visibleAtms = useMemo(
    () => (selectedAreaId ? districtAtms.filter((a) => a.area_id === selectedAreaId) : districtAtms),
    [districtAtms, selectedAreaId],
  );

  const topAtms = useMemo(
    () => [...districtAtms].sort((a, b) => b.risk.risk_score - a.risk.risk_score).slice(0, 25),
    [districtAtms],
  );

  if (!districtFeature) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">District not found.</p>
        <Link to="/gis" className="text-accent-600">
          Back to Telangana overview
        </Link>
      </div>
    );
  }

  const props = districtFeature.properties;

  function handleSelectAtm(atm: Atm) {
    navigate(`/atms/${atm.atm_id}`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div>
          <div className="text-[11px] text-slate-400">
            <Link to="/gis" className="hover:underline">
              Telangana
            </Link>{' '}
            / {props.district_name}
          </div>
          <h1 className="text-lg font-bold text-navy-900">{props.district_name} District</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <RiskBadge level={props.risk_level} score={props.risk_score} />
          <span className="text-slate-500">{props.atm_total} ATMs</span>
          <span className="text-slate-500">{props.high_risk_atm_count} high-risk</span>
          {props.district_highlight && (
            <span className="badge badge-critical">Above highlight threshold ({props.highlight_threshold})</span>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1">
          <DistrictMap
            district={districtFeature}
            areas={districtAreas}
            atms={visibleAtms}
            onSelectArea={(areaId) => setSelectedAreaId((cur) => (cur === areaId ? null : areaId))}
            onSelectAtm={handleSelectAtm}
          />
        </div>
        <div className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
          {districtAreas.length > 0 && (
            <>
              <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Areas ({districtAreas.length})
              </div>
              {districtAreas
                .slice()
                .sort((a, b) => b.properties.risk_score - a.properties.risk_score)
                .map((f) => (
                  <button
                    key={f.properties.area_id}
                    onClick={() =>
                      setSelectedAreaId((cur) => (cur === f.properties.area_id ? null : f.properties.area_id))
                    }
                    className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-2 text-left hover:bg-slate-50 ${
                      selectedAreaId === f.properties.area_id ? 'bg-accent-600/5' : ''
                    }`}
                  >
                    <span className="text-sm text-navy-900">{f.properties.area_name}</span>
                    <RiskBadge level={f.properties.risk_level} />
                  </button>
                ))}
            </>
          )}
          <div className="border-b border-t border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Top Risk ATMs
          </div>
          {topAtms.map((atm) => (
            <button
              key={atm.atm_id}
              onClick={() => navigate(`/atms/${atm.atm_id}`)}
              className="flex w-full flex-col gap-0.5 border-b border-slate-100 px-4 py-2 text-left hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium text-navy-900">{atm.bank_name}</span>
                <RiskBadge level={atm.risk.risk_level} score={atm.risk.risk_score} />
              </div>
              <span className="truncate text-[11px] text-slate-500">{atm.address}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
