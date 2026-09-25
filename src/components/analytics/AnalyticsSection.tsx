import { Fragment, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useStore } from '@/state/store';
import { RISK_COLORS, useBankAlerts, useBankCases, useDistrictAlerts, useDistrictCases } from '@/lib/selectors';
import { getDemoChartSignals } from '@/lib/demoData';
import type { RiskLevel } from '@/types/contract';
import {
  CHART_INK,
  ChartCard,
  DonutStat,
  GRID_COLOR,
  RISK_ORDER,
  SEQUENTIAL_HUE,
  SERIES_ALERT,
  SERIES_GREEN,
  SERIES_RED,
  SURFACE,
  tooltipStyle,
  type DonutSlice,
} from './ChartPrimitives';

const crimeTimeBuckets = ['00–03', '03–06', '06–09', '09–12', '12–15', '15–18', '18–21', '21–24'];

export const cybercrimePatternData = [
  { category: 'UPI Fraud', values: [18, 12, 21, 35, 42, 51, 68, 44] },
  { category: 'Phishing', values: [12, 9, 15, 28, 31, 38, 47, 32] },
  { category: 'Investment Fraud', values: [6, 4, 8, 16, 22, 29, 41, 25] },
  { category: 'Digital Arrest', values: [3, 2, 5, 11, 18, 27, 36, 21] },
  { category: 'OTP / Card Fraud', values: [14, 10, 17, 26, 34, 43, 52, 37] },
  { category: 'Identity Theft', values: [8, 6, 10, 15, 19, 24, 29, 20] },
  { category: 'Loan / Marketplace Fraud', values: [10, 7, 13, 22, 27, 33, 39, 28] },
  { category: 'Other Financial Fraud', values: [7, 5, 9, 18, 24, 30, 35, 23] },
] as const;

type SpatialPoint = {
  transactionId: string;
  distance: number;
  amount: number;
  category: string;
  linkedTransactions: number;
  district: string;
  bank: string;
};

export const financialSpatialData: SpatialPoint[] = [
  { transactionId: 'TXN-10482', distance: 3.2, amount: 85000, category: 'UPI Fraud', linkedTransactions: 4, district: 'Nalgonda', bank: 'SBI' },
  { transactionId: 'TXN-10491', distance: 7.8, amount: 42000, category: 'Phishing', linkedTransactions: 2, district: 'Hyderabad', bank: 'HDFC Bank' },
  { transactionId: 'TXN-10504', distance: 12.4, amount: 115000, category: 'Investment Fraud', linkedTransactions: 5, district: 'Warangal', bank: 'ICICI Bank' },
  { transactionId: 'TXN-10512', distance: 5.1, amount: 68000, category: 'Digital Arrest', linkedTransactions: 3, district: 'Karimnagar', bank: 'Union Bank' },
  { transactionId: 'TXN-10523', distance: 18.7, amount: 32000, category: 'Card / OTP Fraud', linkedTransactions: 1, district: 'Khammam', bank: 'Axis Bank' },
  { transactionId: 'TXN-10537', distance: 9.3, amount: 94000, category: 'UPI Fraud', linkedTransactions: 4, district: 'Medchal', bank: 'SBI' },
  { transactionId: 'TXN-10544', distance: 22.5, amount: 128000, category: 'Investment Fraud', linkedTransactions: 6, district: 'Nizamabad', bank: 'HDFC Bank' },
  { transactionId: 'TXN-10558', distance: 4.6, amount: 51000, category: 'Phishing', linkedTransactions: 2, district: 'Rangareddy', bank: 'Canara Bank' },
  { transactionId: 'TXN-10569', distance: 15.2, amount: 76000, category: 'Digital Arrest', linkedTransactions: 3, district: 'Siddipet', bank: 'Union Bank' },
  { transactionId: 'TXN-10577', distance: 28.4, amount: 36000, category: 'Card / OTP Fraud', linkedTransactions: 1, district: 'Adilabad', bank: 'Axis Bank' },
  { transactionId: 'TXN-10586', distance: 6.9, amount: 102000, category: 'UPI Fraud', linkedTransactions: 5, district: 'Hyderabad', bank: 'SBI' },
  { transactionId: 'TXN-10593', distance: 11.7, amount: 47000, category: 'Phishing', linkedTransactions: 2, district: 'Mahbubnagar', bank: 'ICICI Bank' },
  { transactionId: 'TXN-10608', distance: 31.5, amount: 140000, category: 'Investment Fraud', linkedTransactions: 7, district: 'Warangal', bank: 'HDFC Bank' },
  { transactionId: 'TXN-10614', distance: 8.1, amount: 63000, category: 'Digital Arrest', linkedTransactions: 3, district: 'Nalgonda', bank: 'Union Bank' },
  { transactionId: 'TXN-10627', distance: 19.6, amount: 88000, category: 'UPI Fraud', linkedTransactions: 4, district: 'Khammam', bank: 'SBI' },
  { transactionId: 'TXN-10635', distance: 2.7, amount: 39000, category: 'Card / OTP Fraud', linkedTransactions: 1, district: 'Medchal', bank: 'Axis Bank' },
];

const spatialCategoryColors: Record<string, string> = {
  'UPI Fraud': '#2a78d6',
  Phishing: '#2f8f68',
  'Investment Fraud': '#7b61a8',
  'Digital Arrest': '#c17b30',
  'Card / OTP Fraud': '#64748b',
};

export const forecastRiskSignals = [
  { time: '00:00', predictedAlerts: 18, highRiskATMActivity: 30, criticalSignals: 4 },
  { time: '02:00', predictedAlerts: 21, highRiskATMActivity: 18, criticalSignals: 9 },
  { time: '04:00', predictedAlerts: 29, highRiskATMActivity: 14, criticalSignals: 7 },
  { time: '06:00', predictedAlerts: 24, highRiskATMActivity: 26, criticalSignals: 15 },
  { time: '08:00', predictedAlerts: 47, highRiskATMActivity: 37, criticalSignals: 12 },
  { time: '10:00', predictedAlerts: 63, highRiskATMActivity: 42, criticalSignals: 28 },
  { time: '12:00', predictedAlerts: 58, highRiskATMActivity: 55, criticalSignals: 22 },
  { time: '14:00', predictedAlerts: 76, highRiskATMActivity: 64, criticalSignals: 46 },
  { time: '16:00', predictedAlerts: 88, highRiskATMActivity: 52, criticalSignals: 39 },
  { time: '18:00', predictedAlerts: 61, highRiskATMActivity: 68, criticalSignals: 25 },
  { time: '20:00', predictedAlerts: 39, highRiskATMActivity: 44, criticalSignals: 18 },
  { time: '22:00', predictedAlerts: 28, highRiskATMActivity: 31, criticalSignals: 11 },
] as const;

const trendDemoSignals = [
  { cases: 0, alerts: 1 },
  { cases: 1, alerts: 0 },
  { cases: 2, alerts: 3 },
  { cases: 3, alerts: 2 },
  { cases: 2, alerts: 4 },
  { cases: 3, alerts: 2 },
  { cases: 6, alerts: 8 },
  { cases: 4, alerts: 6 },
  { cases: 7, alerts: 5 },
  { cases: 3, alerts: 6 },
  { cases: 4, alerts: 3 },
  { cases: 6, alerts: 7 },
  { cases: 3, alerts: 9 },
  { cases: 4, alerts: 3 },
] as const;

const alertSeverityDemoFloor: Record<RiskLevel, number> = {
  LOW: 2,
  MEDIUM: 4,
  HIGH: 3,
  CRITICAL: 8,
};

const caseStatusDemoFloor = {
  investigating: 4,
  actionInitiated: 3,
  resolved: 2,
} as const;

type PatternRow = { category: string; values: number[] };

function Heatmap({ data }: { data: PatternRow[] }) {
  const [hoveredCell, setHoveredCell] = useState<{ category: string; time: string; count: number } | null>(null);
  const maxCount = Math.max(...data.flatMap((row) => row.values));

  return (
    <div className="relative h-full overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[minmax(112px,1.35fr)_repeat(8,minmax(42px,1fr))] gap-1 text-[9px] text-gray-950">
          <div />
          {crimeTimeBuckets.map((time) => <div key={time} className="text-center font-semibold">{time}</div>)}
          {data.map((row) => (
            <Fragment key={row.category}>
              <div className="flex items-center pr-1 text-[10px] font-medium leading-tight">{row.category}</div>
              {row.values.map((count, index) => {
                const intensity = 0.08 + (count / maxCount) * 0.82;
                const isHovered = hoveredCell?.category === row.category && hoveredCell.time === crimeTimeBuckets[index];
                return (
                  <button
                    key={`${row.category}-${crimeTimeBuckets[index]}`}
                    type="button"
                    className="flex min-h-7 items-center justify-center rounded-sm border text-[10px] font-semibold transition-transform duration-150 hover:z-10 hover:scale-105 focus-visible:z-10"
                    style={{
                      backgroundColor: `rgba(42, 120, 214, ${intensity})`,
                      borderColor: isHovered ? CHART_INK : 'rgba(42, 120, 214, 0.2)',
                      color: count > 38 ? '#ffffff' : CHART_INK,
                    }}
                    onMouseEnter={() => setHoveredCell({ category: row.category, time: crimeTimeBuckets[index], count })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onFocus={() => setHoveredCell({ category: row.category, time: crimeTimeBuckets[index], count })}
                    onBlur={() => setHoveredCell(null)}
                    aria-label={`${row.category}, ${crimeTimeBuckets[index]}, ${count} complaints`}
                  >
                    {count}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-gray-950">
          <span>Low</span>
          <span className="h-2.5 w-24 rounded-sm" style={{ background: 'linear-gradient(to right, rgba(42,120,214,0.08), rgba(42,120,214,0.9))' }} />
          <span>High</span>
        </div>
      </div>
      {hoveredCell && (
        <div className="pointer-events-none absolute right-2 top-0 z-20 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-gray-950 shadow-card">
          <div className="font-semibold">{hoveredCell.time} · {hoveredCell.category}</div>
          <div className="mt-0.5">Complaint Count: <span className="font-semibold">{hoveredCell.count}</span></div>
        </div>
      )}
    </div>
  );
}

function SpatialTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SpatialPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-gray-950 shadow-card">
      <div className="mb-1 font-semibold">{point.transactionId}</div>
      <div>Amount: <span className="font-semibold">₹{point.amount.toLocaleString('en-IN')}</span></div>
      <div>Distance: <span className="font-semibold">{point.distance} km</span></div>
      <div>Category: <span className="font-semibold">{point.category}</span></div>
      <div>Linked Transactions: <span className="font-semibold">{point.linkedTransactions}</span></div>
      <div>District: <span className="font-semibold">{point.district}</span></div>
      <div>Bank: <span className="font-semibold">{point.bank}</span></div>
    </div>
  );
}

export default function AnalyticsSection({ districtId, bankId }: { districtId?: string; bankId?: string } = {}) {
  const allCases = useStore((s) => s.cases);
  const allAlerts = useStore((s) => s.alerts);
  const districtCases = useDistrictCases(districtId);
  const districtAlerts = useDistrictAlerts(districtId);
  const bankCases = useBankCases(bankId);
  const bankAlerts = useBankAlerts(bankId);
  const district = useStore((s) => s.districtsGeojson?.features.find((feature) => feature.properties.district_id === districtId)?.properties);
  const bankAtms = useStore((s) => (bankId ? s.atmsByBankId.get(bankId) ?? [] : []));
  const cases = bankId ? bankCases : districtId ? districtCases : allCases;
  const alerts = bankId ? bankAlerts : districtId ? districtAlerts : allAlerts;
  const isScoped = Boolean(districtId || bankId);
  const bankRiskScore = bankAtms.length
    ? bankAtms.reduce((total, atm) => total + atm.risk.risk_score, 0) / bankAtms.length
    : 0;
  const scopeFactor = district ? 0.65 + district.risk_score * 0.7 : bankId ? 0.65 + bankRiskScore * 0.7 : 1;
  const districtName = district?.district_name;
  const bankName = bankAtms[0]?.bank_name ?? bankId;
  const scopeName = bankName ?? districtName;
  const chartScopeKey = districtId ?? bankId ?? 'telangana';
  const demoChartSignals = useMemo(
    () => getDemoChartSignals(chartScopeKey, scopeFactor),
    [chartScopeKey, scopeFactor],
  );

  const scopedPatternData = useMemo(
    () => cybercrimePatternData.map((row) => ({
      ...row,
      values: demoChartSignals.pattern[cybercrimePatternData.indexOf(row)],
    })),
    [demoChartSignals],
  );

  const scopedForecastData = useMemo(
    () => forecastRiskSignals.map((signal, index) => ({
      ...signal,
      ...demoChartSignals.forecast[index],
    })),
    [demoChartSignals],
  );

  const scopedSpatialData = useMemo(
    () => financialSpatialData.map((point, index) => ({
      ...point,
      ...demoChartSignals.spatial[index],
      district: scopeName ?? point.district,
      transactionId: districtId || bankId ? `${districtId ?? bankId}-${String(index + 1).padStart(2, '0')}` : point.transactionId,
    })),
    [bankId, districtId, scopeName, demoChartSignals],
  );

  const caseStatusDonut = useMemo<DonutSlice[]>(() => {
    let investigating = 0;
    let actionInitiated = 0;
    let resolved = 0;
    for (const c of cases) {
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') resolved++;
      else if (c.status === 'ACTION_INITIATED') actionInitiated++;
      else investigating++;
    }
    return [
      { name: 'Under Investigation', value: Math.max(investigating, caseStatusDemoFloor.investigating), color: RISK_COLORS.MEDIUM },
      { name: 'Action Initiated', value: Math.max(actionInitiated, caseStatusDemoFloor.actionInitiated), color: RISK_COLORS.HIGH },
      { name: 'Resolved', value: Math.max(resolved, caseStatusDemoFloor.resolved), color: RISK_COLORS.LOW },
    ];
  }, [cases]);

  const displayedCaseTotal = caseStatusDonut.reduce((total, slice) => total + slice.value, 0);
  const resolutionRate = displayedCaseTotal ? Math.round((caseStatusDonut[2].value / displayedCaseTotal) * 100) : 0;

  const alertSeverityDonut = useMemo<DonutSlice[]>(() => {
    const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const a of alerts) counts[a.severity]++;
    return RISK_ORDER.map((level) => ({
      name: level,
      value: Math.max(counts[level], alertSeverityDemoFloor[level]),
      color: RISK_COLORS[level],
    }));
  }, [alerts]);

  const displayedAlertTotal = alertSeverityDonut.reduce((total, slice) => total + slice.value, 0);
  const highRiskAlertPct = displayedAlertTotal
    ? Math.round(((alertSeverityDonut[2].value + alertSeverityDonut[3].value) / displayedAlertTotal) * 100)
    : 0;

  const trend = useMemo(() => {
    const days: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      days.push({
        key: d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
        label: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' }),
      });
    }
    const caseCounts = new Map<string, number>();
    for (const c of cases) {
      const key = new Date(c.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      caseCounts.set(key, (caseCounts.get(key) ?? 0) + 1);
    }
    const alertCounts = new Map<string, number>();
    for (const a of alerts) {
      const key = new Date(a.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      alertCounts.set(key, (alertCounts.get(key) ?? 0) + 1);
    }
    return days.map((d, index) => ({
      day: d.label,
      cases: Math.max(caseCounts.get(d.key) ?? 0, demoChartSignals.trend[index].cases, trendDemoSignals[index].cases, 1),
      alerts: Math.max(alertCounts.get(d.key) ?? 0, demoChartSignals.trend[index].alerts, trendDemoSignals[index].alerts, 1),
    }));
  }, [cases, alerts, demoChartSignals]);

  return (
    <div className="mt-4">
      <h2 className="mb-3 text-sm font-bold text-navy-900">Analytics</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutStat
          title="Case Resolution Status"
          data={caseStatusDonut}
          centerValue={`${resolutionRate}%`}
          centerLabel="Resolved"
        />
        <DonutStat
          title="Alert Severity Mix"
          data={alertSeverityDonut}
          centerValue={`${highRiskAlertPct}%`}
          centerLabel="High + Critical"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="New Cases — Last 14 Days" height="h-64">
          <ResponsiveContainer>
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: CHART_INK, fontSize: 10 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
              <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle()} />
              <Area type="monotone" dataKey="cases" name="New Cases" stroke={SEQUENTIAL_HUE} fill={SEQUENTIAL_HUE} fillOpacity={0.22} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts Generated — Last 14 Days" height="h-64">
          <ResponsiveContainer>
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: CHART_INK, fontSize: 10 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
              <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle()} />
              <Area type="monotone" dataKey="alerts" name="Alerts Generated" stroke={SERIES_ALERT} fill={SERIES_ALERT} fillOpacity={0.22} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Predicted Risk Signals — Next 24 Hours"
        subtitle="Forecasted withdrawal alerts and risk activity by hour (IST)"
        height="h-80 sm:h-96"
      >
        <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-950">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEQUENTIAL_HUE }} />Predicted Withdrawal Alerts</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_GREEN }} />High-Risk ATM Activity</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_RED }} />Critical Risk Signals</span>
        </div>
        <ResponsiveContainer>
          <AreaChart data={scopedForecastData} margin={{ top: 8, right: 12, left: 4, bottom: 22 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: CHART_INK, fontSize: 10 }}
              axisLine={{ stroke: GRID_COLOR }}
              tickLine={false}
              label={{ value: 'Time (IST)', position: 'insideBottom', offset: -14, fill: CHART_INK, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: CHART_INK, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Risk / Activity Index', angle: -90, position: 'insideLeft', offset: 12, fill: CHART_INK, fontSize: 11 }}
            />
            <Tooltip
              {...tooltipStyle()}
              labelFormatter={(label) => `${label} IST`}
              formatter={(value, name, item) => [
                name === 'Predicted Withdrawal Alerts'
                  ? `${value} (±${item.payload.uncertainty})`
                  : value,
                name,
              ]}
            />
            <ReferenceLine x="14:00" stroke={SERIES_RED} strokeDasharray="3 3" strokeOpacity={0.45} label={{ value: 'Peak Risk Window', position: 'insideTopRight', fill: CHART_INK, fontSize: 10 }} />
            <Area
              type="linear"
              dataKey="predictedAlerts"
              name="Predicted Withdrawal Alerts"
              stroke={SEQUENTIAL_HUE}
              fill={SEQUENTIAL_HUE}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: SURFACE }}
              animationDuration={650}
            />
            <Area
              type="linear"
              dataKey="highRiskATMActivity"
              name="High-Risk ATM Activity"
              stroke={SERIES_GREEN}
              fill={SERIES_GREEN}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: SURFACE }}
              animationDuration={650}
            />
            <Area
              type="linear"
              dataKey="criticalSignals"
              name="Critical Risk Signals"
              stroke={SERIES_RED}
              fill={SERIES_RED}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: SURFACE }}
              animationDuration={650}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Cybercrime Pattern Matrix"
          subtitle="Complaint concentration by fraud category and time of day"
          height="h-80"
        >
          <Heatmap data={scopedPatternData} />
        </ChartCard>

        <ChartCard
          title="Financial Exposure vs Spatial Proximity"
          subtitle="Relationship between transaction value and distance from complaint origin"
          height="h-80"
        >
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 24 }}>
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis
                type="number"
                dataKey="distance"
                domain={[0, 50]}
                tick={{ fill: CHART_INK, fontSize: 10 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                label={{ value: 'Distance from Complaint Origin (km)', position: 'insideBottom', offset: -16, fill: CHART_INK, fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="amount"
                domain={[0, 150000]}
                ticks={[0, 25000, 50000, 75000, 100000, 125000, 150000]}
                tickFormatter={(value) => value === 0 ? '₹0' : `₹${value / 1000}K`}
                tick={{ fill: CHART_INK, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Transaction Amount (₹)', angle: -90, position: 'insideLeft', offset: 12, fill: CHART_INK, fontSize: 10 }}
              />
              <ZAxis type="number" dataKey="linkedTransactions" range={[45, 150]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<SpatialTooltip />} />
              {Object.entries(spatialCategoryColors).map(([category, color]) => (
                <Scatter
                  key={category}
                  name={category}
                  data={scopedSpatialData.filter((point) => point.category === category)}
                  fill={color}
                  fillOpacity={0.7}
                  stroke={color}
                  strokeOpacity={0.9}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-950">
            {Object.entries(spatialCategoryColors).map(([category, color]) => (
              <span key={category} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{category}</span>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
