import { useParams } from 'react-router-dom';
import { useDistrictCases } from '@/lib/selectors';
import { useStore } from '@/state/store';
import DistrictDrilldown from './DistrictDrilldown';
import AnalyticsSection from '@/components/analytics/AnalyticsSection';

export default function CoordinatorDetail() {
  const { districtId } = useParams();
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const cases = useDistrictCases(districtId);

  const district = districtsGeojson?.features.find((f) => f.properties.district_id === districtId)?.properties;
  const coordinator = cases[0]?.assigned_lea ?? {
    unit_id: '—',
    unit_name: district ? `${district.district_name} Cybercrime Unit` : 'Cybercrime Unit',
  };

  return (
    <DistrictDrilldown
      backTo="/coordinators"
      backLabel="District Coordinators"
      extraHeader={
        <p className="text-xs text-slate-500">
          Coordinator: {coordinator.unit_name} · Unit ID {coordinator.unit_id}
        </p>
      }
      belowMap={<AnalyticsSection districtId={districtId} />}
    />
  );
}
