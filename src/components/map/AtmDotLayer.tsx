import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { Atm } from '@/types/contract';

interface Props {
  atms: Atm[];
  interactive?: boolean;
  onSelect?: (atm: Atm) => void;
}

/**
 * Renders ATM points on a single shared canvas layer instead of one DOM
 * marker each — the only way thousands of state-level dots stay smooth.
 * State-level view uses interactive=false (DOT_ONLY per the data contract);
 * district drill-down passes interactive=true to allow selection.
 */
export default function AtmDotLayer({ atms, interactive = false, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 });
    const layer = L.layerGroup();

    for (const atm of atms) {
      const color =
        atm.risk.risk_level === 'CRITICAL'
          ? '#c0392b'
          : atm.risk.risk_level === 'HIGH'
            ? '#e0662f'
            : atm.risk.risk_level === 'MEDIUM'
              ? '#f5a623'
              : '#1d4a85';

      const marker = L.circleMarker([atm.lat, atm.lon], {
        renderer,
        radius: interactive ? 5 : 2.2,
        color: interactive ? '#0a1628' : color,
        weight: interactive ? 1 : 0,
        fillColor: color,
        fillOpacity: interactive ? 0.9 : 0.75,
        interactive,
      });

      if (interactive) {
        marker.bindTooltip(`${atm.bank_name}<br/>${atm.risk.risk_level} · ${Math.round(atm.risk.risk_score * 100)}`, {
          direction: 'top',
          sticky: true,
        });
        marker.on('click', () => onSelect?.(atm));
      }

      layer.addLayer(marker);
    }

    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, atms, interactive, onSelect]);

  return null;
}
