import type { AuditEvent } from '@/types/contract';

type IconProps = { className?: string };

function AlertIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 3l9 16H3l9-16z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function CaseIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" />
    </svg>
  );
}

function PredictionIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const ENTITY_META: Record<AuditEvent['entity_type'], { Icon: (p: IconProps) => JSX.Element; colorClass: string }> = {
  ALERT: { Icon: AlertIcon, colorClass: 'bg-orange-100 text-orange-700 border-orange-300' },
  CASE: { Icon: CaseIcon, colorClass: 'bg-sky-100 text-sky-700 border-sky-300' },
  PREDICTION: { Icon: PredictionIcon, colorClass: 'bg-violet-100 text-violet-700 border-violet-300' },
  ACTION: { Icon: ActionIcon, colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};
