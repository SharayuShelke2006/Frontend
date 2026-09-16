import { formatCurrency, formatIstTime } from '@/lib/selectors';
import type { PredictedPath } from '@/types/contract';

export default function FundFlowPath({ path }: { path: PredictedPath }) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Predicted Fund-flow Path · {path.path_id}
        </h3>
        <span className="badge badge-medium">Path probability {Math.round(path.path_probability * 100)}%</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {path.nodes.map((node, i) => {
          const edge = i > 0 ? path.edges[i - 1] : null;
          return (
            <div key={node.node_id} className="flex items-center gap-2">
              {i > 0 && (
                <div className="flex flex-col items-center px-1 text-center">
                  <span
                    className={`h-0.5 w-10 ${edge?.predicted ? 'border-t-2 border-dashed border-red-400' : 'bg-navy-700'}`}
                  />
                  {edge && !edge.predicted && (
                    <span className="mt-1 whitespace-nowrap text-[10px] text-slate-500">
                      {formatCurrency(edge.amount ?? 0)}
                    </span>
                  )}
                  {edge?.predicted && (
                    <span className="mt-1 whitespace-nowrap text-[10px] font-semibold text-red-500">predicted</span>
                  )}
                </div>
              )}
              <div
                className={`rounded-lg border px-3 py-2 text-center ${
                  node.node_type === 'ATM'
                    ? 'border-red-300 bg-red-50'
                    : node.node_type === 'VICTIM_ACCOUNT'
                      ? 'border-slate-300 bg-slate-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  {node.node_type.replaceAll('_', ' ')}
                </div>
                <div className="text-sm font-semibold text-navy-900">{node.label}</div>
                <div className="text-[10px] text-slate-400">{node.node_id}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        Observed transfers are shown as solid edges with timestamps and amounts; the final edge into the ATM is a{' '}
        <span className="font-semibold text-red-500">predicted, not confirmed</span> cash-out step.
        {path.edges[0]?.timestamp && <> First observed transfer at {formatIstTime(path.edges[0].timestamp)}.</>}
      </div>
    </div>
  );
}
