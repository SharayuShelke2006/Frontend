import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';

export default function ToastHost() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 6000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2000] w-80 motion-fade-up">
      <div className="panel flex items-start gap-3 border-l-4 border-l-accent-600 p-3 shadow-lg">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[11px] font-bold text-white">
          !
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-900">{toast.message}</p>
          <button
            onClick={() => {
              clearToast();
              navigate('/alerts');
            }}
            className="mt-1 text-xs font-semibold text-accent-600 hover:underline"
          >
            View alerts →
          </button>
        </div>
        <button onClick={clearToast} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
