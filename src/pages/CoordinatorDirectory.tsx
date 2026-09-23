import { useNavigate } from 'react-router-dom';
import DistrictBadgeGrid from '@/components/coordinators/DistrictBadgeGrid';

export default function CoordinatorDirectory() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">District-wise LEA Coordinators</h1>
      <p className="mb-4 text-xs text-slate-500">
        Select a district to view its cybercrime unit and district-scoped case/alert analytics.
      </p>
      <DistrictBadgeGrid onSelect={(districtId) => navigate(`/coordinators/${districtId}`)} />
    </div>
  );
}
