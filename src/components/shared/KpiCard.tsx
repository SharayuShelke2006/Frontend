interface Props {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: 'default' | 'critical' | 'warning' | 'good';
  onClick?: () => void;
}

const TONE_CLASS: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-navy-900',
  critical: 'text-red-600',
  warning: 'text-amber-600',
  good: 'text-emerald-600',
};

export default function KpiCard({ label, value, sublabel, tone = 'default', onClick }: Props) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`panel flex flex-col gap-1 px-4 py-3 text-left ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${TONE_CLASS[tone]}`}>{value}</span>
      {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
    </Comp>
  );
}
