// The two real jigs (photos cut out on a transparent background), hung by their nose ring:
// - "slim": long navy-back jig, front double assist + tail treble;
// - "heavy": wide holographic jig, double assist hooks at both ends.
// The nose ring sits at ~69% of the picture's width (the hooks hang on the left),
// so the CSS shifts each picture to put the ring right on the line.
export default function Jig({ model, className = '' }: { model: 'slim' | 'heavy'; className?: string }) {
  return (
    <span className={className}>
      <img src={`/img/jigs/jig-${model}.png`} alt="" draggable={false} />
    </span>
  );
}
