import type { RiskLevel } from '@/types/contract';

const CLASS_BY_LEVEL: Record<RiskLevel, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export default function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  return (
    <span className={`badge ${CLASS_BY_LEVEL[level]}`}>
      {level}
      {typeof score === 'number' ? ` · ${Math.round(score * 100)}` : ''}
    </span>
  );
}
