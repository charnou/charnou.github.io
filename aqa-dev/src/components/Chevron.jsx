export function Chevron({ s = 14, c = "#484F58" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16">
      <path
        d="M4 6l4 4 4-4"
        stroke={c}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
