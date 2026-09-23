interface Props {
  size?: number;
  className?: string;
  variant?: 'icon' | 'full';
}

export default function NirikshakLogo({ size = 32, className = '', variant = 'icon' }: Props) {
  if (variant === 'full') {
    return (
      <img
        src="/nirikshak-logo.jpg"
        alt="Nirikshak"
        style={{ height: size }}
        className={`w-auto shrink-0 object-contain ${className}`}
      />
    );
  }

  return (
    <img
      src="/nirikshak-icon.png"
      alt="Nirikshak"
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full bg-white object-contain p-0.5 ${className}`}
    />
  );
}
