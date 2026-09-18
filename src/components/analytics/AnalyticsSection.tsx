import { useMemo, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '@/state/store';
import { RISK_COLORS } from '@/lib/selectors';
import type { RiskLevel } from '@/types/contract';

const CHART_INK = '#52514e';
const GRID_COLOR = '#e1e0d9';
const SURFACE = '#fcfcfb';
const SEQUENTIAL_HUE = '#2a78d6';
const SERIES_ALERT = '#eb6834';

const RISK_ORDER: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function ChartCard({ title, children, height = 'h-56' }: { title: string; children: ReactNode; height?: string }) {
  return (
    <div className="panel p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className={`${height} w-full`}>{children}</div>
    </div>
  );
}

function tooltipStyle() {
  return {
    contentStyle: {
      fontSize: 12,
      borderRadius: 6,
      border: '1px solid #e1e0d9',
      boxShadow: '0 1px 6px rgba(15,31,61,0.08)',
    },
    cursor: { fill: 'rgba(11,11,11,0.04)' },
  };
}

function legendStyle() {
  return { fontSize: 11, color: CHART_INK, paddingTop: 8 };
}

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

function DonutStat({
  title,
  data,
  centerValue,
  centerLabel,
}: {
  title: string;
  data: DonutSlice[];
  centerValue: string;
  centerLabel: string;
}) {
  return (
    <div className="panel p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={data.length > 1 ? 2 : 0}
                stroke={SURFACE}
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-navy-900">{centerValue}</span>
            <span className="text-center text-[9px] leading-tight text-slate-400">{centerLabel}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2 text-xs">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
                {d.name}
              </span>
              <span className="font-semibold tabular-nums text-navy-900">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AnalyticsSection() {
  const atms = useStore((s) => s.atms);
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const cases = useStore((s) => s.cases);
  const alerts = useStore((s) => s.alerts);

  const riskDistribution = useMemo(() => {
    const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const a of atms) counts[a.risk.risk_level]++;
    return RISK_ORDER.map((level) => ({ level, count: counts[level] }));
  }, [atms]);

  const topDistricts = useMemo(() => {
    const list = districtsGeojson?.features.map((f) => f.properties) ?? [];
    return [...list]
      .sort((a, b) => b.high_risk_atm_count - a.high_risk_atm_count)
      .slice(0, 8)
      .map((d) => ({ name: d.district_name, count: d.high_risk_atm_count }))
      .reverse();
  }, [districtsGeojson]);

  const alertsByHour = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const a of alerts) {
      const hour = new Date(a.predicted_window.start).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        hour12: false,
      });
      buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
    }
    return [...buckets.entries()]
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [alerts]);

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
      { name: 'Under Investigation', value: investigating, color: RISK_COLORS.MEDIUM },
      { name: 'Action Initiated', value: actionInitiated, color: RISK_COLORS.HIGH },
      { name: 'Resolved', value: resolved, color: RISK_COLORS.LOW },
    ];
  }, [cases]);

  const resolutionRate = cases.length ? Math.round((caseStatusDonut[2].value / cases.length) * 100) : 0;

  const alertSeverityDonut = useMemo<DonutSlice[]>(() => {
    const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const a of alerts) counts[a.severity]++;
    return RISK_ORDER.map((level) => ({ name: level, value: counts[level], color: RISK_COLORS[level] }));
  }, [alerts]);

  const highRiskAlertPct = alerts.length
    ? Math.round(((alertSeverityDonut[2].value + alertSeverityDonut[3].value) / alerts.length) * 100)
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
    return days.map((d) => ({
      day: d.label,
      cases: caseCounts.get(d.key) ?? 0,
      alerts: alertCounts.get(d.key) ?? 0,
    }));
  }, [cases, alerts]);

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

      <ChartCard title="Cases & Alerts — Last 14 Days" height="h-64">
        <ResponsiveContainer>
          <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: CHART_INK, fontSize: 10 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle()} />
            <Legend wrapperStyle={legendStyle()} iconType="square" iconSize={8} />
            <Area
              type="monotone"
              dataKey="cases"
              name="New Cases"
              stroke={SEQUENTIAL_HUE}
              fill={SEQUENTIAL_HUE}
              fillOpacity={0.22}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="alerts"
              name="Alerts Generated"
              stroke={SERIES_ALERT}
              fill={SERIES_ALERT}
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="ATMs by Risk Level (Statewide)">
          <ResponsiveContainer>
            <BarChart data={riskDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="level" tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
              <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle()} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {riskDistribution.map((d) => (
                  <Cell key={d.level} fill={RISK_COLORS[d.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Districts by High-Risk ATM Count">
          <ResponsiveContainer>
            <BarChart data={topDistricts} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: CHART_INK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle()} />
              <Bar dataKey="count" fill={SEQUENTIAL_HUE} radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Predicted Alert Windows by Hour (IST)">
        <ResponsiveContainer>
          <BarChart data={alertsByHour} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle()} />
            <Bar dataKey="count" fill={SEQUENTIAL_HUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
