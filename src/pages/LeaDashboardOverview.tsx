import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import DistrictBadgeGrid from '@/components/coordinators/DistrictBadgeGrid';

export default function LeaDashboardOverview() {
  const navigate = useNavigate();
  const districts = useStore((s) => s.districtsGeojson?.features ?? []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-navy-900">LEA Dashboard</h1>
        </div>
        <span className="text-xs text-slate-400">{districts.length} districts monitored</span>
      </div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-accent-600 pl-3">
          <h2 className="text-xl font-bold tracking-tight text-navy-900">District-wise Coordinators</h2>
          <p className="mt-1 text-xs text-slate-500">Select a district to open its operational dashboard</p>
        </div>
        <span className="text-xs font-medium text-accent-600">{districts.length} districts</span>
      </div>
      <DistrictBadgeGrid onSelect={(districtId) => navigate(`/lea-dashboard/district/${districtId}`)} />
    </div>
  );
}