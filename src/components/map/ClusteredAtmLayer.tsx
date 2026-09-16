import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import type { Atm } from '@/types/contract';
import { RISK_COLORS } from '@/lib/selectors';

interface Props {
  atms: Atm[];
  onSelect: (atm: Atm) => void;
}

function riskIcon(atm: Atm) {
  const color = RISK_COLORS[atm.risk.risk_level];
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(10,22,40,0.4)"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export default function ClusteredAtmLayer({ atms, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17,
    });

    for (const atm of atms) {
      const marker = L.marker([atm.lat, atm.lon], { icon: riskIcon(atm) });
      marker.bindTooltip(`${atm.bank_name}<br/>${atm.risk.risk_level} · ${Math.round(atm.risk.risk_score * 100)}`);
      marker.on('click', () => onSelect(atm));
      cluster.addLayer(marker);
    }

    cluster.addTo(map);
    return () => {
      cluster.remove();
    };
  }, [map, atms, onSelect]);

  return null;
}
