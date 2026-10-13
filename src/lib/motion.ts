import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useEffect, type RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

let lenis: Lenis | null = null;

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

export const scrollLock = {
  lock: () => { lenis?.stop(); document.documentElement.style.overflow = 'hidden'; },
  unlock: () => { lenis?.start(); document.documentElement.style.overflow = ''; },
};

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

/**
 * Fade/slide in every [data-reveal] element inside `scope` as it enters the
 * viewport - including elements rendered later (async data).
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay || 0);
        el.style.transitionDelay = `${delay}s`;
        el.classList.add('is-in');
        io.unobserve(el);
        // Hand the element back to its own styles (hover transitions etc.).
        setTimeout(() => {
          el.removeAttribute('data-reveal');
          el.classList.remove('is-in');
          el.style.transitionDelay = '';
        }, 1200 + delay * 1000);
      }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    const scan = () => root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger, useGSAP };
