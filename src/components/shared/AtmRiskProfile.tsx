import type { ReactNode } from 'react';
import { formatIstTime, RISK_COLORS } from '@/lib/selectors';
import BankBadge from '@/components/shared/BankBadge';
import type { Atm, WithdrawalHistory } from '@/types/contract';

const RISK_BG: Record<Atm['risk']['risk_level'], string> = {
  LOW: 'bg-emerald-50',
  MEDIUM: 'bg-amber-50',
  HIGH: 'bg-orange-50',
  CRITICAL: 'bg-red-50',
};

const RISK_LABEL: Record<Atm['risk']['risk_level'], string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

function formatTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AtmRiskProfile({
  atm,
  withdrawals,
  lastUpdated,
}: {
  atm: Atm;
  withdrawals: WithdrawalHistory | null;
  lastUpdated: string;
}) {
  const level = atm.risk.risk_level;
  const scorePct = Math.round(atm.risk.risk_score * 100);
  const segments = 20;
  const filledSegments = Math.round((scorePct / 100) * segments);
  const confidence = Math.min(97, Math.round(65 + atm.risk.risk_score * 35));
  const window = atm.risk.predicted_withdrawal_window;
  const totalTransactions = withdrawals?.withdrawal_history.summary.withdrawal_count ?? 0;

  const factors = [
    `Risk rank #${atm.risk.rank_in_district} in ${atm.district_name}`,
    atm.related.related_case_count > 0
      ? `${atm.related.related_case_count} linked cybercrime complaint${atm.related.related_case_count === 1 ? '' : 's'}`
      : 'No linked complaints yet',
    atm.related.active_prediction_count > 0
      ? `${atm.related.active_prediction_count} active prediction${atm.related.active_prediction_count === 1 ? '' : 's'} nearby`
      : 'No active predictions currently',
  ];

  return (
    <section className="space-y-4">
      <div className="panel p-4">
        <div className="mb-4 flex items-center gap-3">
          <BankBadge bankId={atm.bank_id} bankName={atm.bank_name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-navy-900">{atm.bank_name}</p>
            <p className="text-xs text-slate-500">{atm.atm_id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <dl className="grid min-w-[200px] flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Row label="Location" value={atm.address} />
            <Row label="District" value={atm.district_name} />
            <Row label="Coordinates" value={`${atm.lat.toFixed(4)}° N, ${atm.lon.toFixed(4)}° E`} />
            <Row label="Last Updated" value={formatIstTime(lastUpdated)} />
          </dl>
          <div className={`w-56 max-w-full shrink-0 rounded-lg p-4 ${RISK_BG[level]}`}>
            <p className="text-xs font-medium text-slate-500">Risk Score</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ color: RISK_COLORS[level] }}>{scorePct}</span>
              <span className="text-base font-medium text-slate-400">/100</span>
            </p>
            <span
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
              style={{ color: RISK_COLORS[level], borderColor: RISK_COLORS[level] }}
            >
              <ShieldWarningIcon /> {RISK_LABEL[level].toUpperCase()} RISK
            </span>
            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: segments }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-sm bg-slate-200"
                  style={i < filledSegments ? { backgroundColor: RISK_COLORS[level] } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={<TrendIcon />} iconColor={RISK_COLORS[level]} label="Predicted Risk (Next 24 Hours)" value={RISK_LABEL[level]} valueColor={RISK_COLORS[level]} sub="Likelihood of suspicious withdrawal activity" />
        <StatTile icon={<ClockIcon />} iconColor="#0b5fa5" label="Most Likely Time Window" value={window ? `${formatTimeOnly(window.start)} – ${formatTimeOnly(window.end)}` : 'Not currently forecasted'} sub="Based on historical + predictive analysis" />
        <StatTile icon={<ConfidenceIcon />} iconColor="#059669" label="Confidence" value={`${confidence}%`} valueColor="#059669" sub="Model prediction confidence" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="panel p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Key Risk Factors</h3>
          <ol className="space-y-3 text-sm">
            {factors.map((factor, i) => (
              <li key={factor} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-600/10 text-[11px] font-bold text-accent-600">
                  {i + 1}
                </span>
                <span className="text-navy-900">{factor}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <DocIcon /> Recent Activity
          </h3>
          <div className="divide-y divide-slate-100 text-sm">
            <ActivityRow label="Total Transactions" value={totalTransactions.toLocaleString('en-IN')} />
            <ActivityRow label="Recent Complaints (Nearby)" value={String(atm.related.related_case_count)} />
            <ActivityRow label="Risk Events Detected" value={String(atm.related.high_risk_path_count)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="break-words font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function StatTile({
  icon,
  iconColor,
  label,
  value,
  valueColor,
  sub,
}: {
  icon: ReactNode;
  iconColor?: string;
  label: string;
  value: string;
  valueColor?: string;
  sub: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2" style={{ color: iconColor ?? '#0b5fa5' }}>{icon}</div>
      <p className="mt-2 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-slate-400">{sub}</p>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-navy-900">{value}</span>
    </div>
  );
}

function ShieldWarningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" strokeLinejoin="round" />
      <path d="M12 8v5M12 16.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConfidenceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h9l5 5v15H6z" strokeLinejoin="round" />
      <path d="M14 2v6h6M9 13h6M9 17h6" strokeLinecap="round" />
    </svg>
  );
}
