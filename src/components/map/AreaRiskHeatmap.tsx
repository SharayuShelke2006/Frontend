import { GeoJSON, Pane } from 'react-leaflet';
import type { StyleFunction } from 'leaflet';
import type { AreaFeatureProperties } from '@/lib/data';
import { RISK_COLORS, RISK_FILL_OPACITY } from '@/lib/selectors';
import type { Atm, RiskLevel } from '@/types/contract';

interface Props {
  areas: GeoJSON.Feature<GeoJSON.Geometry, AreaFeatureProperties>[];
  fallbackGeometry?: GeoJSON.Geometry;
  fallbackAreaId?: string;
  fallbackAreaName?: string;
  districtRiskScore: number;
  districtRiskLevel: RiskLevel;
  atms: Atm[];
  visible: boolean;
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 0.75) return 'CRITICAL';
  if (score >= 0.5) return 'HIGH';
  if (score >= 0.25) return 'MEDIUM';
  return 'LOW';
}

export default function AreaRiskHeatmap({
  areas,
  fallbackGeometry,
  fallbackAreaId = 'district-fallback',
  fallbackAreaName = 'District risk fallback',
  districtRiskScore,
  districtRiskLevel,
  atms,
  visible,
}: Props) {
  if (!visible) return null;

  const heatmapAreas = areas.length > 0
    ? areas
    : fallbackGeometry
      ? [{
          type: 'Feature',
          geometry: fallbackGeometry,
          properties: {
            area_id: fallbackAreaId,
            area_name: fallbackAreaName,
            district_id: fallbackAreaId,
            risk_score: districtRiskScore,
            risk_level: districtRiskLevel,
            high_risk_atm_count: 0,
            atm_ids: atms.map((atm) => atm.atm_id),
          },
        } as GeoJSON.Feature<GeoJSON.Geometry, AreaFeatureProperties>]
      : [];

  if (heatmapAreas.length === 0) return null;

  const areaCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties> = {
    type: 'FeatureCollection',
    features: heatmapAreas,
  };

  const effectiveRiskByArea = new Map(
    heatmapAreas.map((area) => {
      const props = area.properties;
      const areaAtms = atms.filter((atm) => props.atm_ids.includes(atm.atm_id));
      const atmSignal = areaAtms.length
        ? areaAtms.reduce((sum, atm) => sum + atm.risk.risk_score, 0) / areaAtms.length
        : null;
      const localSignal = atmSignal === null
        ? props.risk_score
        : props.risk_score * 0.6 + atmSignal * 0.4;
      const effectiveScore = districtRiskScore * 0.7 + localSignal * 0.3;
      const riskLevel = scoreToRisk(effectiveScore);
      return [props.area_id, { riskLevel, score: effectiveScore }] as const;
    }),
  );

  const style: StyleFunction<AreaFeatureProperties> = (feature) => {
    const props = feature!.properties;
    const effectiveRisk = effectiveRiskByArea.get(props.area_id);
    const riskLevel = (effectiveRisk?.riskLevel ?? districtRiskLevel) as keyof typeof RISK_COLORS;
    return {
      color: '#1b344b',
      weight: 1.4,
      fillColor: RISK_COLORS[riskLevel] ?? '#cbd5e1',
      fillOpacity: Math.min(Math.max(RISK_FILL_OPACITY[riskLevel] ?? 0.6, 0.6), 0.88),
      interactive: false,
    };
  };

  return (
    <Pane name="areaRiskHeatmap" style={{ zIndex: 450, pointerEvents: 'none' }}>
      <GeoJSON
        data={areaCollection}
        style={style}
      />
    </Pane>
  );
}