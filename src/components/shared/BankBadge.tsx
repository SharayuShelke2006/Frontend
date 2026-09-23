import { getBankInitials, pickBankPalette } from '@/lib/bankBadge';

interface Props {
  bankId: string;
  bankName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
};

export default function BankBadge({ bankId, bankName, size = 'md', showName = false, className = '' }: Props) {
  const palette = pickBankPalette(bankId);
  const initials = getBankInitials(bankName);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ${palette.bg} ${palette.text} ${palette.ring} ${SIZE_CLASS[size]}`}
        title={bankName}
      >
        {initials}
      </div>
      {showName && <span className="min-w-0 truncate text-sm font-medium text-navy-900">{bankName}</span>}
    </div>
  );
}
