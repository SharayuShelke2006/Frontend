export default function StatusStepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, i) => (
        <span
          key={step}
          className={`badge ${i < currentIndex ? 'badge-low' : i === currentIndex ? 'badge-current' : 'badge-neutral'}`}
        >
          {step}
        </span>
      ))}
    </div>
  );
}
