import { useMemo, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
const SEQUENTIAL_HUE = '#2a78d6';

const RISK_ORDER: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const CASE_STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  UNDER_INVESTIGATION: 'Investigating',
  FINANCIAL_INTELLIGENCE_PROCESSING: 'FI Processing',
  ACTION_INITIATED: 'Action Initiated',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="h-56 w-full">{children}</div>
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

  const caseStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cases) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    return [...counts.entries()].map(([status, count]) => ({
      status: CASE_STATUS_LABELS[status] ?? status,
      count,
    }));
  }, [cases]);

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

  return (
    <div className="mt-4">
      <h2 className="mb-3 text-sm font-bold text-navy-900">Analytics</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <ChartCard title="Cases by Status">
          <ResponsiveContainer>
            <BarChart data={caseStatus} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fill: CHART_INK, fontSize: 10 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fill: CHART_INK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle()} />
              <Bar dataKey="count" fill={SEQUENTIAL_HUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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
    </div>
  );
}
