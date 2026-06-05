const SIZES = {
  sm: { width: 90, height: 26 },
  md: { width: 130, height: 36 },
  lg: { width: 180, height: 50 },
};

export default function DineFlowLogo({ size = 'md', className = '' }) {
  const { width, height } = SIZES[size] || SIZES.md;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DineFlow"
      className={className}
    >
      <path
        d="M 55 15 A 35 35 0 1 1 55 85"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 52 30 C 68 30 82 25 94 30"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 52 50 C 72 50 86 44 102 50"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M 52 70 C 70 70 84 65 94 70"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="102" cy="50" r="4" fill="#FF6B00" />
      <text
        x="118"
        y="58"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="32"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        DineFlow
      </text>
    </svg>
  );
}
