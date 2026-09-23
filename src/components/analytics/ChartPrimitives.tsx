import { type ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RiskLevel } from '@/types/contract';

export const CHART_INK = '#111827';
export const GRID_COLOR = '#e1e0d9';
export const SURFACE = '#fcfcfb';
export const SEQUENTIAL_HUE = '#2a78d6';
export const SERIES_ALERT = '#eb6834';
export const SERIES_GREEN = '#2f8f68';
export const SERIES_RED = '#d84a4a';

export const RISK_ORDER: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function ChartCard({
  title,
  subtitle,
  children,
  height = 'h-56',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: string;
}) {
  return (
    <div className="panel p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-950">{title}</h3>
      {subtitle && <p className="-mt-2 mb-3 text-[11px] text-gray-950">{subtitle}</p>}
      <div className={`${height} w-full`}>{children}</div>
    </div>
  );
}

export function tooltipStyle() {
  return {
    contentStyle: {
      fontSize: 12,
      borderRadius: 6,
      border: '1px solid #e1e0d9',
      boxShadow: '0 1px 6px rgba(15,31,61,0.08)',
      color: CHART_INK,
    },
    cursor: { fill: 'rgba(11,11,11,0.04)' },
  };
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export function DonutStat({
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
