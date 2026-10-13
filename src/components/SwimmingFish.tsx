import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './SwimmingFish.css';

interface Props {
  src: string;
  aspect?: number;
  /** Wave amplitude as a fraction of the fish height at the tail. */
  amp?: number;
  /** Seconds per tail beat - higher is slower. */
  period?: number;
  strips?: number;
  drift?: boolean;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

/**
 * Makes any side-view fish image swim: the picture is sliced into vertical
 * strips and a travelling wave runs from head (left) to tail (right), with the
 * tail moving the most. Works with generated SVG art and uploaded photos.
 */
export default function SwimmingFish({ src, aspect, amp = 0.045, period = 3.2, strips = 26, drift = true, className = '', style, alt = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(aspect ?? 2.6);
  const [w, setW] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (aspect) { setRatio(aspect); return; }
    const img = new Image();
    img.onload = () => img.naturalHeight && setRatio(img.naturalWidth / img.naturalHeight);
    img.src = src;
  }, [src, aspect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  const h = w / ratio;
  const sw = w / strips;

  return (
    <div
      ref={ref}
      className={`swim ${drift ? 'swim--drift' : ''} ${visible ? '' : 'swim--paused'} ${className}`}
      style={{ aspectRatio: String(ratio), ...style }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    >
      {w > 0 && (
        <div className="swim__body" style={{ '--period': `${period}s` } as CSSProperties}>
          {Array.from({ length: strips }, (_, i) => {
            const t = i / (strips - 1);
            const a = h * amp * (0.08 + Math.pow(t, 1.7));
            return (
              <span
                key={i}
                className="swim__strip"
                style={{
                  left: i * sw,
                  width: sw + 1,
                  backgroundImage: `url("${src}")`,
                  backgroundSize: `${w}px ${h}px`,
                  backgroundPosition: `${-i * sw}px 0`,
                  '--a': `${a.toFixed(2)}px`,
                  animationDelay: `${(-t * period * 0.85).toFixed(3)}s`,
                } as CSSProperties}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
