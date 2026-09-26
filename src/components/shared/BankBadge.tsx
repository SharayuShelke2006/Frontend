import { getBankInitials, pickBankPalette } from '@/lib/bankBadge';

const BANK_LOGO_MAP: Record<string, string> = {
  'Andhra Pradesh Grameena Vikas Bank': '/Bank_Logos/Andhra Pradesh Grameena Vikas Bank.jpeg',
  'Axis Bank Ltd': '/Bank_Logos/Axis Bank Ltd.png',
  'BANDHAN BANK LIMITED': '/Bank_Logos/BANDHAN BANK LIMITED 2.png',
  'Bank Of Baroda': '/Bank_Logos/Bank Of Baroda.png',
  'Bank Of India': '/Bank_Logos/Bank Of India.jpeg',
  'Bank Of Maharashtra': '/Bank_Logos/Bank Of Maharashtra.png',
  'Canara Bank': '/Bank_Logos/canara bank.jpeg',
  'Catholic Syrian Bank Ltd': '/Bank_Logos/Catholic Syrian Bank Ltd.jpeg',
  'Central Bank Of India': '/Bank_Logos/central bank of india.jpeg',
  'City Union Bank Ltd': '/Bank_Logos/City Union Bank Ltd.png',
  'DCB bank Ltd': '/Bank_Logos/DCB Bank Ltd.jpeg',
  'Dhanlaxmi Bank': '/Bank_Logos/Dhanlaxmi Bank 2.jpeg',
  'Federal Bank': '/Bank_Logos/Federal Bank 2.jpeg',
  'Fincare Small Finance Bank': '/Bank_Logos/Fincare Small Finance Bank 2.jpeg',
  'HDFC Bank Ltd': '/Bank_Logos/hdfc.png',
  'ICICI Bank Ltd': '/Bank_Logos/ICICI.jpeg',
  'IDBI Bank Ltd': '/Bank_Logos/IDBI Bank Ltd.png',
  'IDFC Bank': '/Bank_Logos/IDFC Bank.png',
  'Indian Bank': '/Bank_Logos/Indian Bank.png',
  'Indian Overseas Bank': '/Bank_Logos/Indian Overseas Bank.png',
  'IndusInd Bank': '/Bank_Logos/IndusInd Bank 3.jpeg',
  'Indusind Bank': '/Bank_Logos/IndusInd Bank 3.jpeg',
  'Jammu & Kashmir Bank Ltd': '/Bank_Logos/Jammu & Kashmir Bank Ltd 2.png',
  'Karnataka Bank Ltd': '/Bank_Logos/Karnataka Bank Ltd.png',
  'Karur Vysya Bank Ltd': '/Bank_Logos/Karur Vysya Bank Ltd.png',
  'Kotak Mahindra Bank Limited': '/Bank_Logos/kotak.png',
  'Lakshmi Vilas Bank Ltd': '/Bank_Logos/Lakshmi Vilas Bank Ltd 1.png',
  'Paytm Payments Bank Ltd.': '/Bank_Logos/Paytm Payments Bank Ltd..jpeg',
  'Punjab & Sind Bank': '/Bank_Logos/Punjab & Sind Bank 1.png',
  'Punjab National Bank': '/Bank_Logos/Punjab.png',
  'RBL Bank Ltd': '/Bank_Logos/RBL Bank Ltd 1.png',
  'RBL Bank ltd': '/Bank_Logos/RBL Bank Ltd 1.png',
  'South Indian Bank Ltd': '/Bank_Logos/South Indian Bank Ltd.png',
  'State Bank Of India': '/Bank_Logos/sbi.png',
  'Telangana Grameena Bank': '/Bank_Logos/Telangana Grameena Bank 2.png',
  'Uco Bank': '/Bank_Logos/UCO Bank 1.png',
  'Union Bank Of India': '/Bank_Logos/union.png',
  'Utkarsh Small Finance Bank': '/Bank_Logos/Utkarsh Small Finance Bank2.jpeg',
  'Yes Bank Ltd': '/Bank_Logos/Yes Bank Ltd.png',
};

function normalizeBankName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function resolveBankLogo(bankName: string) {
  const normalized = normalizeBankName(bankName);
  const match = Object.entries(BANK_LOGO_MAP).find(([key]) => normalizeBankName(key) === normalized);
  return match?.[1];
}

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
  const logoSrc = resolveBankLogo(bankName);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={bankName}
          className={`shrink-0 rounded-full bg-white object-contain ring-1 ${palette.ring} ${SIZE_CLASS[size]}`}
          title={bankName}
        />
      ) : (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ${palette.bg} ${palette.text} ${palette.ring} ${SIZE_CLASS[size]}`}
          title={bankName}
        >
          {initials}
        </div>
      )}
      {showName && <span className="min-w-0 truncate text-sm font-medium text-navy-900">{bankName}</span>}
    </div>
  );
}
