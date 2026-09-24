import { Link, useParams } from 'react-router-dom';
import LeaDashboard from './LeaDashboard';
import { useStore } from '@/state/store';

export default function LeaDistrictDashboard() {
  const { districtId } = useParams();
  const district = useStore((s) => s.districtsGeojson?.features.find((feature) => feature.properties.district_id === districtId));

  if (!districtId || !district) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">District not found.</p>
        <Link to="/lea-dashboard" className="text-accent-600">Back to LEA Dashboard</Link>
      </div>
    );
  }

  return <LeaDashboard districtId={districtId} />;
}