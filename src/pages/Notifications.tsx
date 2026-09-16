import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { formatIstTime } from '@/lib/selectors';

export default function Notifications() {
  const navigate = useNavigate();
  const role = useStore((s) => s.role);
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useStore((s) => s.markAllNotificationsRead);

  const mine = notifications.filter((n) => n.recipient_role === role);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy-900">Notifications Center</h1>
        <button onClick={markAllNotificationsRead} className="text-xs font-medium text-accent-600 hover:underline">
          Mark all read
        </button>
      </div>
      <div className="panel divide-y divide-slate-100">
        {mine.map((n) => (
          <button
            key={n.notification_id}
            onClick={() => {
              markNotificationRead(n.notification_id);
              if (n.related_alert_id) navigate(`/alerts/${n.related_alert_id}`);
            }}
            className={`flex w-full items-start justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50 ${
              n.read ? '' : 'bg-accent-600/5'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent-600" />}
                <span className="text-sm font-semibold text-navy-900">{n.title}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
            </div>
            <span className="shrink-0 text-[11px] text-slate-400">{formatIstTime(n.created_at)}</span>
          </button>
        ))}
        {mine.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications.</div>}
      </div>
    </div>
  );
}
