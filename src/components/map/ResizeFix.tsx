import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Leaflet measures its container's size once at creation. Inside a flex
 * layout the container can still be 0×0 at that point (before the flex
 * box has settled), which leaves the map showing only a couple of
 * mis-aligned tile patches until something else forces a resize. This
 * watches the container and invalidates the size whenever it changes.
 */
export default function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    map.invalidateSize();

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [map]);

  return null;
}
