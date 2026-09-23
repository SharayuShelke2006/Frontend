import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBankAlerts, useBankAtms, useBankCases } from '@/lib/selectors';
import BankBadge from '@/components/shared/BankBadge';
import RiskBadge from '@/components/shared/RiskBadge';
import TelanganaMap from '@/components/map/TelanganaMap';
import { useIntelligenceDrawer } from '@/components/shared/IntelligenceDrawer';
import type { Atm } from '@/types/contract';

export default function BankDetail() {
  const { bankId } = useParams();
  const { open } = useIntelligenceDrawer();
  const atms = useBankAtms(bankId);
  const alerts = useBankAlerts(bankId);
  const cases = useBankCases(bankId);

  const bankName = atms[0]?.bank_name ?? bankId ?? 'Unknown Bank';
  const highRiskAtms = atms.filter((a) => a.risk.risk_level === 'HIGH' || a.risk.risk_level === 'CRITICAL').length;

  const topAtms = useMemo(
    () => [...atms].sort((a, b) => b.risk.risk_score - a.risk.risk_score).slice(0, 50),
    [atms],
  );

  function handleSelectAtm(atm: Atm) {
    open({ type: 'atm', id: atm.atm_id });
  }

  if (!bankId || atms.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Bank not found.</p>
        <Link to="/banks" className="text-accent-600">
          Back to Bank Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <BankBadge bankId={bankId} bankName={bankName} size="md" />
          <div>
            <div className="text-[11px] text-slate-400">
              <Link to="/banks" className="hover:underline">
                Bank Analytics
              </Link>{' '}
              / {bankName}
            </div>
            <h1 className="text-lg font-bold text-navy-900">{bankName}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-4">
          <span className="text-slate-500">{atms.length} ATMs</span>
          <span className="text-slate-500">{highRiskAtms} high-risk</span>
          <span className="text-slate-500">{alerts.length} alerts</span>
          <span className="text-slate-500">{cases.length} linked cases</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-64 min-h-0 shrink-0 lg:h-auto lg:flex-1">
          <TelanganaMap atms={atms} interactiveAtms onSelectAtm={handleSelectAtm} disableDistrictNav />
        </div>
        <div className="w-full min-h-0 flex-1 overflow-y-auto border-t border-slate-200 bg-white lg:w-80 lg:flex-none lg:border-l lg:border-t-0">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {bankName} ATMs ({atms.length})
          </div>
          {topAtms.map((atm) => (
            <button
              key={atm.atm_id}
              onClick={() => open({ type: 'atm', id: atm.atm_id })}
              className="flex w-full flex-col gap-0.5 border-b border-slate-100 px-4 py-2 text-left hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium text-navy-900">{atm.district_name}</span>
                <RiskBadge level={atm.risk.risk_level} score={atm.risk.risk_score} />
              </div>
              <span className="truncate text-[11px] text-slate-500">{atm.address}</span>
            </button>
          ))}
          {atms.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No ATMs found.</div>}
        </div>
      </div>
    </div>
  );
}
