import { useStore } from '@/state/store';
import { formatIstTime } from '@/lib/selectors';
import { ENTITY_META } from '@/components/audit/EntityIcon';

export default function AuditTimeline() {
  const audit = useStore((s) => s.audit);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">Audit / Activity Timeline</h1>
      <p className="mb-6 text-xs text-slate-500">Who did what, when, on which alert/case — {audit.length} events.</p>

      <ol className="relative">
        {audit.length > 1 && (
          <div className="absolute bottom-4 left-[15px] top-4 w-px bg-slate-200" aria-hidden="true" />
        )}
        {audit.map((e, index) => {
          const meta = ENTITY_META[e.entity_type];
          const isNewest = index === 0;
          return (
            <li key={e.event_id} className={`relative flex gap-4 pb-6 ${index === audit.length - 1 ? 'pb-0' : ''}`}>
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  isNewest ? 'border-accent-600 bg-accent-600 text-white' : `${meta.colorClass}`
                }`}
              >
                <meta.Icon className={isNewest ? 'text-white' : ''} />
              </span>
              <div className={`min-w-0 flex-1 border-b border-slate-100 pb-6 ${index === audit.length - 1 ? 'border-none pb-0' : ''}`}>
                <div className="text-[11px] font-semibold text-slate-400">{formatIstTime(e.timestamp)}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-navy-900">{e.event_type.replaceAll('_', ' ')}</span>
                  <span className="badge badge-neutral">{e.actor_role}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{e.summary}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {e.actor_display} · {e.entity_type} {e.entity_id}
                  {e.ip_or_device_reference ? ` · ${e.ip_or_device_reference}` : ''}
                </p>
              </div>
            </li>
          );
        })}
        {audit.length === 0 && <p className="text-sm text-slate-400">No audit events yet.</p>}
      </ol>
    </div>
  );
}
