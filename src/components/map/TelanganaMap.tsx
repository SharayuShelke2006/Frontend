import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import type { Layer, Path, StyleFunction } from 'leaflet';
import { useStore } from '@/state/store';
import { RISK_COLORS, RISK_FILL_OPACITY } from '@/lib/selectors';
import type { DistrictFeatureProperties } from '@/lib/data';
import type { Atm } from '@/types/contract';
import AtmDotLayer from './AtmDotLayer';
import MapLegend from './MapLegend';
import ResizeFix from './ResizeFix';

const TELANGANA_CENTER: [number, number] = [17.95, 79.4];

interface Props {
  riskFilter?: string | null;
  atms?: Atm[];
  interactiveAtms?: boolean;
  onSelectAtm?: (atm: Atm) => void;
  disableDistrictNav?: boolean;
  districtPath?: (districtId: string) => string;
}

export default function TelanganaMap({ riskFilter, atms: atmsOverride, interactiveAtms, onSelectAtm, disableDistrictNav, districtPath }: Props) {
  const navigate = useNavigate();
  const stateGeojson = useStore((s) => s.stateGeojson);
  const districtsGeojson = useStore((s) => s.districtsGeojson);
  const allAtms = useStore((s) => s.atms);
  const atms = atmsOverride ?? allAtms;

  const districtStyle: StyleFunction<DistrictFeatureProperties> = (feature) => {
    const props = feature!.properties;
    const dimmed = riskFilter && props.risk_level !== riskFilter;
    return {
      color: props.district_highlight ? '#071525' : '#365f7f',
      weight: props.district_highlight ? 2.2 : 1.2,
      fillColor: RISK_COLORS[props.risk_level as keyof typeof RISK_COLORS],
      fillOpacity: dimmed ? 0.05 : RISK_FILL_OPACITY[props.risk_level as keyof typeof RISK_FILL_OPACITY],
    };
  };

  function onEachDistrict(feature: GeoJSON.Feature<GeoJSON.Geometry, DistrictFeatureProperties>, layer: Layer) {
    const p = feature.properties;
    layer.bindTooltip(
      `<div style="font-weight:600">${p.district_name}</div>
       <div>${p.risk_level} · score ${p.risk_score.toFixed(2)}</div>
       <div>${p.atm_total} ATMs · ${p.high_risk_atm_count} high-risk</div>`,
      { sticky: true },
    );
    if (!disableDistrictNav) layer.on('click', () => navigate(districtPath?.(p.district_id) ?? `/gis/districts/${p.district_id}`));
    layer.on('mouseover', () => (layer as Path).setStyle({ weight: 3 }));
    layer.on('mouseout', () => (layer as Path).setStyle({ weight: p.district_highlight ? 2 : 1 }));
  }

  const districtsKey = useMemo(() => JSON.stringify(riskFilter), [riskFilter]);

  return (
    <div className="relative h-full w-full">
      <MapContainer center={TELANGANA_CENTER} zoom={7} minZoom={6} maxZoom={16} className="h-full w-full">
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stateGeojson && (
          <GeoJSON
            data={stateGeojson}
            style={{ color: '#0a1628', weight: 2.5, fillOpacity: 0 }}
            interactive={false}
          />
        )}
        {districtsGeojson && (
          <GeoJSON key={districtsKey} data={districtsGeojson} style={districtStyle} onEachFeature={onEachDistrict} />
        )}
        <AtmDotLayer atms={atms} interactive={interactiveAtms ?? false} onSelect={onSelectAtm} />
        <ResizeFix />
      </MapContainer>
      <MapLegend />
    </div>
  );
}
