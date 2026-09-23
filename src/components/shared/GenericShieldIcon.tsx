export default function GenericShieldIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="rounded-full border border-dashed border-slate-300 bg-slate-50 opacity-70"
      aria-label="Generic district police badge (placeholder)"
    >
      <path
        d="M24 6l14 5v9c0 9-6 15.5-14 18-8-2.5-14-9-14-18v-9l14-5z"
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 15v14M17 22h14" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
