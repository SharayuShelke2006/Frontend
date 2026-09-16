import { useState } from 'react';
import { useStore } from '@/state/store';
import PortalChrome from '@/components/citizen/PortalChrome';
import StatusStepper from '@/components/shared/StatusStepper';
import { formatIstTime } from '@/lib/selectors';

const STATUS_STEPS = [
  'RECEIVED',
  'UNDER_INVESTIGATION',
  'FINANCIAL_INTELLIGENCE_PROCESSING',
  'ACTION_INITIATED',
  'RESOLVED',
] as const;

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  UNDER_INVESTIGATION: 'Under Investigation',
  FINANCIAL_INTELLIGENCE_PROCESSING: 'Financial Intelligence Processing',
  ACTION_INITIATED: 'Action Initiated',
  RESOLVED: 'Resolved / Closed',
  CLOSED: 'Resolved / Closed',
};

export default function CitizenTrack() {
  const cases = useStore((s) => s.cases);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const match = cases.find(
    (c) => c.complaint_id.toLowerCase() === query.trim().toLowerCase() || c.case_id.toLowerCase() === query.trim().toLowerCase(),
  );

  const stepIndex = match
    ? Math.max(0, STATUS_STEPS.indexOf(match.status as (typeof STATUS_STEPS)[number]))
    : -1;

  return (
    <PortalChrome>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-1 text-lg font-bold text-navy-900">Track your Complaint</h1>
        <p className="mb-4 text-xs text-slate-500">Enter the Complaint ID or Case ID you received at submission.</p>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(true);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. NCRP-DEMO-20481 or C-20481"
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500"
          />
          <button type="submit" className="rounded bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500">
            Track
          </button>
        </form>

        {searched && !match && (
          <div className="panel mt-4 p-4 text-sm text-slate-500">
            No complaint found for “{query}”. Double-check the ID from your confirmation screen.
          </div>
        )}

        {match && (
          <div className="panel mt-4 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">{match.complaint_id}</div>
                <div className="text-sm font-bold text-navy-900">{match.crime_category.replaceAll('_', ' ')}</div>
              </div>
              <span className="text-xs text-slate-400">Filed {formatIstTime(match.reporting_timestamp)}</span>
            </div>
            <StatusStepper steps={STATUS_STEPS.map((s) => STATUS_LABELS[s])} currentIndex={stepIndex} />
            <p className="mt-4 text-xs text-slate-400">
              For your safety, predicted locations, transaction chains and investigation details are not shown here.
            </p>
          </div>
        )}
      </div>
    </PortalChrome>
  );
}
