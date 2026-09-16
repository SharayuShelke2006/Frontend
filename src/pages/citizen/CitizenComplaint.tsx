import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/state/store';
import PortalChrome from '@/components/citizen/PortalChrome';
import StatusStepper from '@/components/shared/StatusStepper';

const STATUS_STEPS = [
  'Received',
  'Under Investigation',
  'Financial Intelligence Processing',
  'Action Initiated',
  'Resolved / Closed',
];

const INCIDENT_TYPES: { label: string; category: string }[] = [
  { label: 'UPI Fraud', category: 'UPI_FRAUD' },
  { label: 'Online Banking Fraud', category: 'ONLINE_BANKING_FRAUD' },
  { label: 'Investment Scam', category: 'INVESTMENT_SCAM' },
  { label: 'Phishing', category: 'PHISHING' },
  { label: 'Other Cyber Financial Fraud', category: 'CYBER_FINANCIAL_FRAUD' },
  { label: 'Crime Against Women / Children', category: 'CYBER_CRIME_AGAINST_WOMEN_CHILDREN' },
  { label: 'Other Cyber Crime', category: 'OTHER_CYBER_CRIME' },
];

export default function CitizenComplaint() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const submitComplaint = useStore((s) => s.submitComplaint);

  const presetCategory = params.get('category');
  const defaultIncident = INCIDENT_TYPES.find((t) => t.category === presetCategory) ?? INCIDENT_TYPES[0];

  const [submitted, setSubmitted] = useState<{ caseId: string; alertId: string | null } | null>(null);
  const [form, setForm] = useState({
    incidentType: defaultIncident.label,
    incidentTime: '',
    amount: '',
    reference: '',
    contact: '',
    location: '',
    consent: false,
  });

  const isFinancial = INCIDENT_TYPES.find((t) => t.label === form.incidentType)?.category !== 'OTHER_CYBER_CRIME';

  if (submitted) {
    return (
      <PortalChrome>
        <div className="mx-auto max-w-xl">
          <div className="panel p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              ✓
            </div>
            <h1 className="text-lg font-bold text-navy-900">Complaint Registered</h1>
            <p className="mt-1 text-sm text-slate-500">
              Your complaint has been received and acknowledged. Keep this ID for follow-up.
            </p>
            <div className="mx-auto mt-4 w-fit rounded border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-base font-semibold text-navy-900">
              {submitted.caseId}
            </div>
          </div>

          <div className="panel mt-4 p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status</h2>
            <StatusStepper steps={STATUS_STEPS} currentIndex={1} />
            <p className="mt-4 text-xs text-slate-400">
              For your safety, predicted locations, transaction chains and investigation details are not shown here.
              Your assigned unit will contact you if additional information is required.
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/citizen/track')}
              className="flex-1 rounded border border-accent-600 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-600/5"
            >
              Track this Complaint
            </button>
            <button
              onClick={() => navigate('/citizen')}
              className="flex-1 rounded bg-navy-900 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PortalChrome>
    );
  }

  return (
    <PortalChrome>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-1 text-lg font-bold text-navy-900">File a Cybercrime Complaint</h1>
        <p className="mb-4 text-xs text-slate-500">
          This information is used to open a case and route it to the relevant cyber cell.
        </p>
        <form
          className="panel space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const incident = INCIDENT_TYPES.find((t) => t.label === form.incidentType) ?? INCIDENT_TYPES[0];
            const result = submitComplaint({
              incidentType: form.incidentType,
              crimeCategory: incident.category,
              incidentTime: form.incidentTime,
              amount: Number(form.amount) || 0,
              reference: form.reference,
              contact: form.contact,
              location: form.location,
            });
            setSubmitted(result);
          }}
        >
          <Field label="Incident Type">
            <select
              value={form.incidentType}
              onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t.category} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Incident Date/Time">
            <input
              type="datetime-local"
              required
              value={form.incidentTime}
              onChange={(e) => setForm({ ...form, incidentTime: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>
          {isFinancial && (
            <Field label="Amount Lost (₹)">
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          )}
          <Field label="Transaction / Reference Details">
            <input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="UPI ref no., bank name, etc. (optional)"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Contact Number">
            <input
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Known Location (district, if known)">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Hyderabad, Karimnagar…"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>
          <label className="flex items-start gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-0.5"
            />
            I confirm this information is accurate and consent to it being used for investigation purposes.
          </label>
          <button
            type="submit"
            className="w-full rounded bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-500"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </PortalChrome>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}
