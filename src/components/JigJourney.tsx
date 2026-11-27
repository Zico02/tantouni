import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/motion';

// The lures used on the way down, in order: the soft shad first, then the jigs.
// Each one is a cut-out photo hung by its nose ring: `ring` is where that ring sits across
// the picture (0 = left edge, 1 = right edge), `h` is the display height on desktop.
// The jig switches to the next lure, in a blink, every time it goes a bit deeper.
const LURES = [
  { src: '/img/jigs/jig-shad.png', ring: 0.618, top: 0.085, h: 130 },
  { src: '/img/jigs/jig-slim.png', ring: 0.69, top: 0, h: 160 },
  { src: '/img/jigs/jig-pink.png', ring: 0.716, top: 0, h: 160 },
  { src: '/img/jigs/jig-heavy.png', ring: 0.685, top: 0, h: 150 },
  { src: '/img/jigs/jig-squid.png', ring: 0.498, top: 0, h: 175 },
  { src: '/img/jigs/jig-yellow.png', ring: 0.706, top: 0, h: 160 },
];

// The amberjack inside the "Sérioles & Courbines" photo (photo is 994×768, the fish layer
// is the same size with the fish in place). Used to aim the attack at the jig.
const PHOTO = { w: 994, h: 768, posX: 0.7, posY: 0.5 };             // object-position of .giant .tech__photo
// both fish of the photo face right: centre and half length, in photo pixels
const FISHES = {
  amberjack: { cx: 711.5, cy: 235, halfW: 251.5 },
  courbine: { cx: 349, cy: 453, halfW: 248 },
};

/**
 * A jig on its line, hanging straight under the reel (page centre), that follows you down
 * through the sections it wraps (Omar → La saison des géants → the glasses photo) and stops
 * on the glasses. When it passes the "Sérioles & Courbines" card, the amberjack in that
 * photo turns, darts out and bites it, then swims back to its place.
 */
export default function JigJourney({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = ref.current!;
      const q = gsap.utils.selector(wrap);
      const rig = q('.jig-rig')[0];
      const lures = q('.jig-rig__jig');
      const shake = q('.jig-rig__shake')[0];
      const tilt = gsap.quickTo(q('.jig-rig__body')[0], 'rotation', { duration: 0.5, ease: 'power3.out' });

      let top = 0, yStart = 0, yEnd = 1, cardTop = 0, cardH = 1, current = -1;
      let attack: gsap.core.Timeline | null = null;

      // Build the attack for the current layout: 0 → 1 while the jig goes past the card.
      const buildAttack = (card: Element, cardRect: DOMRect, rigX: number) => {
        attack?.kill();
        attack = gsap.timeline({ paused: true });
        // the amberjack strikes first (top of the card), then the courbine (lower down)
        attack.add(strike(card.querySelector<HTMLElement>('.giant__fish--amberjack'), FISHES.amberjack, cardRect, rigX, 0.42), 0);
        attack.add(strike(card.querySelector<HTMLElement>('.giant__fish--courbine'), FISHES.courbine, cardRect, rigX, 0.72), 0.5);
      };
      // One fish: swims on a bit, U-turns, charges, bites the jig, swims back home.
      // `at` = where the jig is on the card at the bite (0 top → 1 bottom).
      const strike = (fish: HTMLElement | null, F: { cx: number; cy: number; halfW: number }, cardRect: DOMRect, rigX: number, at: number) => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        if (!fish) return tl;
        gsap.set(fish, { clearProps: 'transform' });
        // where the fish is drawn inside the card (same maths as object-fit: cover)
        const cw = cardRect.width, ch = cardRect.height;
        const s = Math.max(cw / PHOTO.w, ch / PHOTO.h);
        const ox = (cw - PHOTO.w * s) * PHOTO.posX, oy = (ch - PHOTO.h * s) * PHOTO.posY;
        const fx = ox + F.cx * s, fy = oy + F.cy * s, half = F.halfW * s;
        const jigX = rigX - cardRect.left;                               // the line, inside the card
        const turn = jigX < fx;                                          // jig behind it → turn around first
        const mouth = turn ? fx - half : fx + half;
        const dx = jigX - mouth + (turn ? -26 : 26);                     // mouth a little past the line: jig in its mouth
        const dy = ch * at - fy;                                         // the jig's height at the bite
        const away = turn ? 1 : -1;                                      // the direction it swims away first
        const nip = turn ? 14 : -14;
        gsap.set(fish, { transformOrigin: `${fx}px ${fy}px` });
        return tl
          .to(fish, { x: 70 * away, y: -10, rotation: -4 * away, duration: 0.1, ease: 'sine.inOut' }, 0.14) // swims on a bit…
          .to(fish, { scaleX: turn ? -1 : 1, rotation: 0, duration: 0.05 }, 0.24)                         // …U-turn…
          .to(fish, { x: dx, y: dy, rotation: turn ? 6 : -6, duration: 0.13, ease: 'power3.in' }, 0.29)  // …and charges
          .to(fish, { x: dx + nip, duration: 0.035, yoyo: true, repeat: 3, ease: 'power1.inOut' }, 0.42)   // bites
          .to(shake, { keyframes: [{ rotation: 18 }, { rotation: -16 }, { rotation: 11 }, { rotation: -6 }, { rotation: 0 }], duration: 0.16 }, 0.42)
          .to(fish, { x: 0, y: 0, rotation: 0, duration: 0.17, ease: 'power2.inOut' }, 0.62)            // back home
          .to(fish, { scaleX: 1, duration: 0.06 }, 0.8);
      };

      const measure = () => {
        const sy = window.scrollY;
        top = wrap.getBoundingClientRect().top + sy;
        const media = wrap.querySelector('.season__media');
        const card = wrap.querySelector('.giant--amberjack');
        yStart = 40;
        // stop on the glasses: a little below the top of the photo
        yEnd = media ? media.getBoundingClientRect().top + sy - top + media.getBoundingClientRect().height * 0.2 : wrap.offsetHeight - 300;
        if (card) {
          const c = card.getBoundingClientRect();
          cardTop = c.top + sy - top;
          cardH = c.height;
          buildAttack(card, c, rig.getBoundingClientRect().left);
        }
      };
      const update = () => {
        // the jig rides at ~36% of the screen height while you scroll, between start and stop
        const y = gsap.utils.clamp(yStart, yEnd, window.scrollY + window.innerHeight * 0.36 - top);
        gsap.set(rig, { y });
        const p = (y - yStart) / Math.max(1, yEnd - yStart);
        const i = Math.min(LURES.length - 1, Math.floor(p * LURES.length));
        if (i !== current) {
          lures.forEach((el, k) => el.classList.toggle('is-on', k === i));
          current = i;
        }
        // where the card is right now (read live: it slides in with its reveal animation)
        const card = wrap.querySelector('.giant--amberjack');
        if (card) {
          const c = card.getBoundingClientRect();
          cardTop = c.top + window.scrollY - top;
          cardH = c.height;
        }
        // jig centre ≈ 70px below the ring
        attack?.progress(gsap.utils.clamp(0, 1, (y + 70 - (cardTop - 20)) / (cardH + 40)));
      };
      measure();
      update();
      ScrollTrigger.create({
        trigger: wrap, start: 'top bottom', end: 'bottom top',
        onRefresh: () => { measure(); update(); },
        onUpdate: (st) => { update(); tilt(gsap.utils.clamp(-14, 14, st.getVelocity() / 120)); },
      });
    },
    { scope: ref },
  );

  return (
    <div className="jig-journey" ref={ref}>
      <div className="jig-rig" aria-hidden>
        <span className="jig-rig__line" />
        <div className="jig-rig__body">
          <div className="jig-rig__shake">
            {LURES.map((l, i) => (
              <span key={l.src} className={`jig-rig__jig ${i === 0 ? 'is-on' : ''}`} style={{ ['--ring' as string]: `${l.ring * 100}%`, ['--top' as string]: `${l.top * 100}%`, ['--h' as string]: `${l.h}px` }}>
                <img src={l.src} alt="" draggable={false} />
              </span>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
