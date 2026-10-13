// Hand-drawn red X: drawn stroke by stroke when a caught species comes into view.
export default function XMark({ animate = true }: { animate?: boolean }) {
  return (
    <svg className={`xmark ${animate ? 'xmark--draw' : ''}`} viewBox="0 0 200 200" aria-hidden>
      <path d="M38 34C80 82 122 128 166 170" />
      <path d="M164 30C118 76 82 118 34 168" />
    </svg>
  );
}
