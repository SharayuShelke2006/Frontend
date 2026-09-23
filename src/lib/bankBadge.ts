const GENERIC_WORDS = new Set(['bank', 'ltd', 'limited', 'of', 'and', '&', 'the']);

export function getBankInitials(bankName: string): string {
  const words = bankName
    .replace(/[().]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const significant = words.filter((w) => !GENERIC_WORDS.has(w.toLowerCase()));
  const source = significant.length > 0 ? significant : words;
  const initials = source.map((w) => w[0]!.toUpperCase()).join('');

  return initials.length > 4 ? initials.slice(0, 4) : initials || '?';
}

// Fixed 8-slot categorical order, same hue family the app's own charts already
// draw from (blue/orange/aqua/yellow/magenta/green/violet/red). Cycling 40
// directory entries through 8 hues is a deliberate exception to "never cycle
// categorical hues" — every card always carries a visible name label, never
// color-alone identity, so hue collisions across entries carry no ambiguity.
export const BANK_PALETTE = [
  { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
  { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  { bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
  { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
] as const;

export function pickBankPalette(bankId: string) {
  let hash = 0;
  for (let i = 0; i < bankId.length; i++) hash = (hash + bankId.charCodeAt(i)) % BANK_PALETTE.length;
  return BANK_PALETTE[hash];
}
