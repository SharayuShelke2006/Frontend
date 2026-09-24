import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import BankBadge from '@/components/shared/BankBadge';

interface BankRow {
  bankId: string;
  bankName: string;
  atmCount: number;
  highRiskCount: number;
  alertCount: number;
}

export default function BankDirectory() {
  const navigate = useNavigate();
  const atms = useStore((s) => s.atms);
  const alerts = useStore((s) => s.alerts);

  const banks = useMemo<BankRow[]>(() => {
    const byId = new Map<string, BankRow>();
    for (const atm of atms) {
      let row = byId.get(atm.bank_id);
      if (!row) {
        row = { bankId: atm.bank_id, bankName: atm.bank_name, atmCount: 0, highRiskCount: 0, alertCount: 0 };
        byId.set(atm.bank_id, row);
      }
      row.atmCount++;
      if (atm.risk.risk_level === 'HIGH' || atm.risk.risk_level === 'CRITICAL') row.highRiskCount++;
    }
    for (const alert of alerts) {
      const bankId = alert.recipients.find((r) => r.type === 'BANK')?.id;
      if (bankId && byId.has(bankId)) byId.get(bankId)!.alertCount++;
    }
    return [...byId.values()].sort((a, b) => a.bankName.localeCompare(b.bankName));
  }, [atms, alerts]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-1 text-lg font-bold text-navy-900">Bank Analytics Dashboard</h1>
      <p className="mb-4 text-xs text-slate-500">
        All {banks.length} banks and financial institutions with ATM footprint in Telangana. Select one for detailed analytics.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {banks.map((b) => (
          <button
            key={b.bankId}
            onClick={() => navigate(`/banks/${b.bankId}`)}
            className="panel flex flex-col items-center gap-2 p-4 text-center hover:bg-slate-50"
          >
            <BankBadge bankId={b.bankId} bankName={b.bankName} size="lg" />
            <span className="line-clamp-2 text-xs font-semibold text-navy-900">{b.bankName}</span>
            <div className="flex w-full items-center justify-center gap-2 text-[10px] text-slate-500">
              <span>{b.atmCount} ATMs</span>
              <span>·</span>
              <span>{b.highRiskCount} high-risk</span>
              <span>·</span>
              <span>{b.alertCount} alerts</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
