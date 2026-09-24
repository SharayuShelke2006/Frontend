import { Link, useParams } from 'react-router-dom';
import LeaDashboard from './LeaDashboard';
import { useStore } from '@/state/store';

export default function BankDetail() {
  const { bankId } = useParams();
  const atms = useStore((s) => s.atms);
  const bankExists = Boolean(bankId && atms.some((atm) => atm.bank_id === bankId));

  if (!bankExists) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Bank not found.</p>
        <Link to="/banks/directory" className="text-accent-600">
          Back to Bank Directory
        </Link>
      </div>
    );
  }

  return <LeaDashboard bankId={bankId} />;
}
