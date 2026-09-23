import { DISTRICT_BADGE_MAP } from '@/lib/districtBadges';
import GenericShieldIcon from './GenericShieldIcon';

export default function DistrictBadgeImage({ districtId, size = 48 }: { districtId: string; size?: number }) {
  const src = DISTRICT_BADGE_MAP[districtId];
  if (!src) return <GenericShieldIcon size={size} />;
  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  );
}
