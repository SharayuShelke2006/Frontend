import { useState, type ReactNode } from 'react';

const STATUS_STEPS = [
  'Received',
  'Under Investigation',
  'Financial Intelligence Processing',
  'Action Initiated',
  'Resolved / Closed',
];

export default function CitizenComplaint() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    incidentType: 'UPI Fraud',
    incidentTime: '',
    amount: '',
    reference: '',
    contact: '',
    location: '',
    consent: false,
  });
  const [caseId] = useState(() => `NCRP-DEMO-${10000 + Math.floor(Math.random() * 900)}`);
  const [statusStep] = useState(1); // demo: freshly filed complaints usually already show "Under Investigation"

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="panel p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✓
          </div>
          <h1 className="text-lg font-bold text-navy-900">Complaint Registered</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your complaint has been received and acknowledged. Keep this ID for follow-up.
          </p>
          <div className="mx-auto mt-4 w-fit rounded border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-base font-semibold text-navy-900">
            {caseId}
          </div>
        </div>

        <div className="panel mt-4 p-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_STEPS.map((step, i) => (
              <span key={step} className={`badge ${i <= statusStep ? 'badge-critical' : 'badge-low'}`}>
                {step}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            For your safety, predicted locations, transaction chains and investigation details are not shown here.
            Your assigned unit will contact you if additional information is required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">File a Cybercrime Complaint</h1>
      <p className="mb-4 text-xs text-slate-500">
        This information is used to open a case and route it to the relevant cyber cell.
      </p>
      <form
        className="panel space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Field label="Incident Type">
          <select
            value={form.incidentType}
            onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option>UPI Fraud</option>
            <option>Online Banking Fraud</option>
            <option>Investment Scam</option>
            <option>Phishing</option>
            <option>Other Cyber Financial Fraud</option>
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
        <Field label="Amount Lost (₹)">
          <input
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
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
        <Field label="Known Location (optional)">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
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
