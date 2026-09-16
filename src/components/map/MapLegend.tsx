import { RISK_COLORS } from '@/lib/selectors';
import type { RiskLevel } from '@/types/contract';

const LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function MapLegend({ title = 'District Risk' }: { title?: string }) {
  return (
    <div className="panel absolute bottom-4 left-4 z-[1000] px-3 py-2 text-xs">
      <div className="mb-1.5 font-semibold text-slate-600">{title}</div>
      <div className="flex flex-col gap-1">
        {LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm border border-black/10"
              style={{ backgroundColor: RISK_COLORS[level] }}
            />
            <span className="text-slate-600">{level}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-1">
          <span className="h-2 w-2 rounded-full bg-navy-700" />
          <span className="text-slate-500">ATM location</span>
        </div>
      </div>
    </div>
  );
}
