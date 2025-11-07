export function WeevupLogo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Logo W avec dégradé */}
      <defs>
        <linearGradient id="weevupGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#004645" />
          <stop offset="50%" stopColor="#009197" />
          <stop offset="100%" stopColor="#9CD9F6" />
        </linearGradient>
      </defs>

      {/* Partie gauche du W (vert foncé) */}
      <path
        d="M 40 60 L 60 140 L 80 100 L 100 140 L 120 60"
        stroke="url(#weevupGradient)"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Partie droite du W (bleu clair) */}
      <path
        d="M 100 140 L 120 60 L 140 140 L 160 100"
        stroke="#9CD9F6"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
