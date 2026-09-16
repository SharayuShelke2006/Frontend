import { useMemo } from 'react';
import { GeoJSON, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import type { Layer, StyleFunction } from 'leaflet';
import type { Atm } from '@/types/contract';
import type { AreaFeatureProperties, DistrictFeatureProperties } from '@/lib/data';
import { RISK_COLORS, RISK_FILL_OPACITY } from '@/lib/selectors';
import ClusteredAtmLayer from './ClusteredAtmLayer';
import MapLegend from './MapLegend';
import ResizeFix from './ResizeFix';

interface Props {
  district: GeoJSON.Feature<GeoJSON.Geometry, DistrictFeatureProperties>;
  areas: GeoJSON.Feature<GeoJSON.Geometry, AreaFeatureProperties>[];
  atms: Atm[];
  onSelectArea?: (areaId: string) => void;
  onSelectAtm: (atm: Atm) => void;
}

function FitToDistrict({ geometry }: { geometry: GeoJSON.Geometry }) {
  const map = useMap();
  useMemo(() => {
    const bbox = turf.bbox(geometry);
    map.fitBounds(
      [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ],
      { padding: [24, 24] },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);
  return null;
}

export default function DistrictMap({ district, areas, atms, onSelectArea, onSelectAtm }: Props) {
  const areaCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaFeatureProperties> = useMemo(
    () => ({ type: 'FeatureCollection', features: areas }),
    [areas],
  );

  const areaStyle: StyleFunction<AreaFeatureProperties> = (feature) => {
    const props = feature!.properties;
    return {
      color: '#0a1628',
      weight: 1,
      fillColor: RISK_COLORS[props.risk_level as keyof typeof RISK_COLORS],
      fillOpacity: RISK_FILL_OPACITY[props.risk_level as keyof typeof RISK_FILL_OPACITY] + 0.1,
    };
  };

  function onEachArea(feature: GeoJSON.Feature<GeoJSON.Geometry, AreaFeatureProperties>, layer: Layer) {
    const p = feature.properties;
    layer.bindTooltip(
      `<div style="font-weight:600">${p.area_name}</div><div>${p.risk_level} · ${p.high_risk_atm_count} high-risk ATMs</div>`,
    );
    layer.on('click', () => onSelectArea?.(p.area_id));
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[17.95, 79.4]} zoom={9} className="h-full w-full">
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitToDistrict geometry={district.geometry} />
        <Polygon
          positions={polygonToLatLngs(district.geometry)}
          pathOptions={{ color: '#0a1628', weight: 2.5, fillOpacity: 0 }}
        />
        {areas.length > 0 && <GeoJSON data={areaCollection} style={areaStyle} onEachFeature={onEachArea} />}
        <ClusteredAtmLayer atms={atms} onSelect={onSelectAtm} />
        <ResizeFix />
      </MapContainer>
      <MapLegend title={areas.length > 0 ? 'Area Risk' : 'District Risk'} />
    </div>
  );
}

function polygonToLatLngs(geometry: GeoJSON.Geometry): [number, number][][] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ring.map(([lon, lat]) => [lat, lon] as [number, number]));
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((poly) => poly.map((ring) => ring.map(([lon, lat]) => [lat, lon] as [number, number])));
  }
  return [];
}
