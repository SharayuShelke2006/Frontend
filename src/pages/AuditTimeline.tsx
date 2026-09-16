import { useStore } from '@/state/store';
import { formatIstTime } from '@/lib/selectors';

export default function AuditTimeline() {
  const audit = useStore((s) => s.audit);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">Audit / Activity Timeline</h1>
      <p className="mb-4 text-xs text-slate-500">Who did what, when, on which alert/case — {audit.length} events.</p>
      <ol className="relative border-l border-slate-200 pl-5">
        {audit.map((e) => (
          <li key={e.event_id} className="mb-4">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-navy-900">{e.event_type.replaceAll('_', ' ')}</span>
              <span className="badge badge-low">{e.actor_role}</span>
            </div>
            <p className="text-sm text-slate-600">{e.summary}</p>
            <p className="text-[11px] text-slate-400">
              {formatIstTime(e.timestamp)} · {e.actor_display} · {e.entity_type} {e.entity_id}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
