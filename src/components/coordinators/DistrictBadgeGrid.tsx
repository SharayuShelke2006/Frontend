import { useMemo } from 'react';
import { useStore } from '@/state/store';
import DistrictBadgeImage from '@/components/shared/DistrictBadgeImage';
import RiskBadge from '@/components/shared/RiskBadge';

interface Props {
  selectedDistrictId?: string;
  onSelect: (districtId: string) => void;
  compact?: boolean;
}

export default function DistrictBadgeGrid({ selectedDistrictId, onSelect, compact = false }: Props) {
  const districtsGeojson = useStore((s) => s.districtsGeojson);

  const districts = useMemo(() => {
    const list = districtsGeojson?.features.map((f) => f.properties) ?? [];
    return [...list].sort((a, b) => a.district_name.localeCompare(b.district_name));
  }, [districtsGeojson]);

  return (
    <div
      className={`grid gap-3 ${
        compact
          ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }`}
    >
      {districts.map((d) => {
        const selected = d.district_id === selectedDistrictId;
        return (
          <button
            key={d.district_id}
            onClick={() => onSelect(d.district_id)}
            className={`panel flex flex-col items-center gap-1.5 p-3 text-center hover:bg-slate-50 ${
              selected ? 'ring-2 ring-accent-600 bg-accent-600/5' : ''
            }`}
          >
            <DistrictBadgeImage districtId={d.district_id} size={compact ? 40 : 56} />
            <span className="line-clamp-2 text-[11px] font-semibold text-navy-900">{d.district_name}</span>
            {!compact && <RiskBadge level={d.risk_level} />}
          </button>
        );
      })}
    </div>
  );
}
