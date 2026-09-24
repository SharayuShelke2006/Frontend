import { useNavigate } from 'react-router-dom';
import PortalChrome from '@/components/citizen/PortalChrome';

const CATEGORIES = [
  {
    key: 'women-children',
    title: 'Women / Children Related Crime',
    desc: 'Report online abuse, exploitation or harassment targeting women and children.',
    category: 'CYBER_CRIME_AGAINST_WOMEN_CHILDREN',
    accent: 'from-rose-600 to-rose-800',
  },
  {
    key: 'financial-fraud',
    title: 'Financial Fraud',
    desc: 'Report UPI fraud, unauthorized withdrawals, phishing or online banking fraud.',
    category: 'CYBER_FINANCIAL_FRAUD',
    accent: 'from-accent-600 to-navy-900',
  },
  {
    key: 'other',
    title: 'Other Cyber Crime',
    desc: 'Report hacking, identity theft, or any other cyber offence not listed above.',
    category: 'OTHER_CYBER_CRIME',
    accent: 'from-slate-600 to-slate-800',
  },
];

const NOTICES = [
  'NCRP prototype launched for SIH 2026 (Problem Statement SIH26184).',
  'All complaint, prediction and alert data on this portal is simulated for demonstration.',
  'For real cybercrime complaints, please visit the official NCRP portal: cybercrime.gov.in',
];

export default function CitizenHome() {
  const navigate = useNavigate();

  return (
    <PortalChrome>
      {/* Hero */}
      <div className="citizen-hero mb-7 overflow-hidden px-6 py-8 sm:px-10 sm:py-11">
        <p className="citizen-eyebrow text-xs font-semibold uppercase tracking-widest">
          Predictive Cybercrime Intelligence · Citizen Services
        </p>
        <h1 className="citizen-hero-title mt-2 text-3xl font-bold">Report Cybercrime. Get Protected.</h1>
        <p className="citizen-hero-copy mt-3 max-w-xl text-sm">
          File a complaint about financial fraud or other cyber offences. Your complaint feeds directly into an
          intelligence pipeline that helps law enforcement act before funds are withdrawn.
        </p>
        <button
          onClick={() => navigate('/citizen/complaint')}
          className="citizen-primary-button mt-6 rounded px-5 py-2.5 text-sm font-semibold"
        >
          Register a Complaint →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="citizen-section-title mb-4 text-base font-bold">What would you like to report?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.key} className="citizen-service-card overflow-hidden rounded-lg bg-white">
                <div className={`citizen-service-icon citizen-service-icon--${c.key} flex h-24 items-center justify-center`}>
                  <CategoryIcon iconKey={c.key} />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-navy-900">{c.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
                  <button
                    onClick={() => navigate(`/citizen/complaint?category=${c.category}`)}
                    className="citizen-primary-button mt-4 w-full rounded py-2 text-xs font-semibold"
                  >
                    Register a Complaint
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="citizen-track-panel mt-6 rounded-lg bg-white p-5">
            <h2 className="mb-2 text-sm font-bold text-navy-900">Already filed a complaint?</h2>
            <p className="mb-3 text-xs text-slate-500">Track its status using your Complaint ID.</p>
            <button
              onClick={() => navigate('/citizen/track')}
              className="citizen-secondary-button rounded px-4 py-2 text-xs font-semibold"
            >
              Track your Complaint →
            </button>
          </div>
        </div>

        <aside className="citizen-news-panel h-fit rounded-lg bg-white">
          <div className="citizen-news-header px-4 py-3 text-xs font-bold uppercase tracking-wide">
            What's New
          </div>
          <ul className="divide-y divide-slate-100">
            {NOTICES.map((n, i) => (
              <li key={i} className="px-4 py-3 text-xs text-slate-600">
                {n}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PortalChrome>
  );
}

function CategoryIcon({ iconKey }: { iconKey: string }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 } as const;
  if (iconKey === 'women-children') {
    return (
      <svg {...common}>
        <circle cx="12" cy="7" r="3" />
        <path d="M6 21v-3a6 6 0 0112 0v3" strokeLinecap="round" />
      </svg>
    );
  }
  if (iconKey === 'financial-fraud') {
    return (
      <svg {...common}>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" strokeLinejoin="round" />
    </svg>
  );
}
