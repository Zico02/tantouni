import { lazy, Suspense, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import HeroLens from '../components/HeroLens';
import SwimmingFish from '../components/SwimmingFish';
import BoatSeats from '../components/BoatSeats';
import CaughtStamp from '../components/CaughtStamp';
import { Arrow, Check } from '../components/icons';
import { SocialIcon } from '../components/Footer';
import { gsap, useGSAP, useReveal } from '../lib/motion';
import { fishVisual } from '../lib/fishArt';
import { fishName, useFish } from '../lib/useFish';
import { SITE } from '../lib/site';
import { currentLang } from '../i18n';
import './Home.css';

const OceanScene = lazy(() => import('../components/OceanScene'));

function Hero() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.hero__lens', { y: 80, scale: 0.86, opacity: 0, duration: 1.8 })
        .from('.hero__title span', { yPercent: 110, opacity: 0, stagger: 0.06, duration: 1.2 }, '-=1.3')
        .from('.hero__tagline, .hero__kicker', { y: 20, opacity: 0, duration: 1 }, '-=0.9')
        .from('.hero__sub, .hero__ctas', { y: 24, opacity: 0, stagger: 0.1, duration: 1 }, '-=0.8');

      gsap.to('.hero__lens', {
        scale: 1.35, y: -60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__content', {
        y: 140, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: '20% top', end: 'bottom top', scrub: true },
      });
    },
    { scope: ref },
  );

  return (
    <section className="hero" ref={ref}>
      <div className="hero__scene">
        <Suspense fallback={null}><OceanScene /></Suspense>
      </div>
      <div className="hero__fade" />
      <div className="hero__inner">
        <p className="hero__kicker kicker">{t('hero.kicker')}</p>
        <div className="hero__lens"><HeroLens /></div>
        <div className="hero__content">
          <h1 className="hero__title display" aria-label="TANTOUNI">
            {'TANTOUNI'.split('').map((c, i) => <span key={i}>{c}</span>)}
          </h1>
          <p className="hero__tagline display">{t('hero.tagline')}</p>
          <p className="hero__sub">{t('hero.sub')}</p>
          <div className="hero__ctas">
            <Link to="/reservation" className="btn">{t('hero.ctaBook')} <Arrow /></Link>
            <Link to="/tableau-de-chasse" className="btn ghost">{t('hero.ctaCollection')}</Link>
          </div>
        </div>
      </div>
      <div className="hero__scroll"><span />{t('hero.scroll')}</div>
    </section>
  );
}

function Marquee() {
  const { t } = useTranslation();
  const words = t('marquee', { returnObjects: true }) as string[];
  const row = [...words, ...words];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {[0, 1].map((k) => (
          <div className="marquee__group" key={k}>
            {row.map((w, i) => (
              <span key={i} className={`display ${i % 2 ? 'outline-text' : ''}`}>
                {w}<i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Captain() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = Math.round(obj.v) + (el.dataset.suffix || ''); },
        });
      });
    },
    { scope: ref },
  );
  return (
    <section className="section captain" ref={ref}>
      <div className="container captain__grid">
        <div>
          <span className="kicker" data-reveal>{t('captain.kicker')}</span>
          <h2 className="h2 display" data-reveal>{t('captain.title')}</h2>
          <p className="lead" data-reveal>{t('captain.text')}</p>
          <div className="captain__social" data-reveal>
            <Link to="/palmares" className="btn sm">🏆 {t('palmares.see')}</Link>
            {(Object.keys(SITE.socials) as (keyof typeof SITE.socials)[]).map((k) => (
              <a key={k} href={SITE.socials[k]} target="_blank" rel="noreferrer" className="btn ghost sm">
                <SocialIcon name={k} /> {k[0].toUpperCase() + k.slice(1)}
              </a>
            ))}
          </div>
        </div>
        <div className="captain__stats">
          <div className="stat glass" data-reveal>
            <b className="display"><span data-count="100">0</span>K</b>
            <span>{t('captain.followers')}</span>
          </div>
          <div className="stat stat--gold glass" data-reveal data-reveal-delay="0.1">
            <b className="display">{t('captain.igfaValue')}</b>
            <span>{t('captain.igfa')}</span>
          </div>
          <div className="stat glass" data-reveal data-reveal-delay="0.2">
            <b className="display" data-count={SITE.boats}>0</b>
            <span>{t('captain.boats')}</span>
          </div>
          <div className="stat glass" data-reveal data-reveal-delay="0.3">
            <b className="display" data-count={SITE.boats * SITE.seatsPerBoat}>0</b>
            <span>{t('captain.seats')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Season() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.fromTo('.season__img', { scale: 1.25, yPercent: -6 }, {
        scale: 1, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    { scope: ref },
  );
  return (
    <section className="season" ref={ref}>
      <img className="season__img" src="/img/season-of-giants.webp" alt="Tuna & marlin - the season of giants" />
      <div className="season__shade" />
      <div className="container season__text">
        <span className="kicker" data-reveal>{t('season.kicker')}</span>
        <h2 className="h2 display" data-reveal>{t('season.title')}</h2>
        <p className="lead" data-reveal>{t('season.text')}</p>
      </div>
    </section>
  );
}

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  return (
    <motion.div
      className={`tilt ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0.5); y.set(0.5); }}
    >
      {children}
    </motion.div>
  );
}

const techIcons = {
  jigging: <path d="M12 2v5m0 0c-2.5 0-4 2-4 5 0 4 2 9 4 10 2-1 4-6 4-10 0-3-1.5-5-4-5zm0 15v5m-2-1h4" />,
  trolling: <path d="M2 16c3 0 3-2 6-2s3 2 6 2 3-2 6-2M4 20c3 0 3-2 6-2s3 2 6 2M14 4l6 6-8 2 2-8z" />,
  livebait: <path d="M15 3v8a4 4 0 1 1-8 0M15 3l-2 2m2-2 2 2M3 18c2-2 5-2 7 0s5 2 7 0 4-2 4-2" />,
};

function Experience() {
  const { t } = useTranslation();
  return (
    <section className="section experience">
      <div className="container">
        <span className="kicker" data-reveal>{t('experience.kicker')}</span>
        <h2 className="h2 display" data-reveal>{t('experience.title')}</h2>
        <div className="experience__grid">
          {(['jigging', 'trolling', 'livebait'] as const).map((k, i) => (
            <div key={k} data-reveal data-reveal-delay={i * 0.12}>
              <TiltCard className="tech glass">
                <span className="tech__num display outline-text">0{i + 1}</span>
                <svg viewBox="0 0 24 24" className="tech__icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{techIcons[k]}</svg>
                <h3 className="display">{t(`experience.${k}.t`)}</h3>
                <p>{t(`experience.${k}.d`)}</p>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const { t } = useTranslation();
  const includes = t('offer.includes', { returnObjects: true }) as string[];
  return (
    <section className="section offer">
      <div className="container offer__grid">
        <div className="offer__card glass" data-reveal>
          <span className="kicker">{t('offer.kicker')}</span>
          <h2 className="h2 display">{t('offer.title')}</h2>
          <div className="offer__price">
            <b className="display">{SITE.pricePerPerson}</b>
            <span><em className="display">{SITE.currency}</em>{t('offer.perPerson')}</span>
          </div>
          <ul className="offer__list">
            <li><Check />{t('offer.boats')} · {t('offer.seatsPerBoat')}</li>
            <li><Check />{t('offer.departure')}</li>
            {includes.map((x) => <li key={x}><Check />{x}</li>)}
          </ul>
          <Link to="/reservation" className="btn">{t('offer.cta')} <Arrow /></Link>
        </div>
        <div className="offer__boats" data-reveal data-reveal-delay="0.15">
          <BoatSeats boatsLeft={[SITE.seatsPerBoat, SITE.seatsPerBoat]} seatsPerBoat={SITE.seatsPerBoat} mine={[2, 0]} />
        </div>
      </div>
    </section>
  );
}

function Teaser() {
  const { t } = useTranslation();
  const { fish } = useFish();
  const lang = currentLang();
  const caught = fish?.filter((f) => f.caught) ?? [];
  const shown = (caught.length >= 3 ? caught : fish ?? []).slice(0, 3);
  return (
    <section className="section teaser">
      <div className="teaser__rays" />
      <div className="container teaser__grid">
        <div>
          <span className="kicker" data-reveal>{t('teaser.kicker')}</span>
          <h2 className="h2 display" data-reveal>{t('teaser.title')}</h2>
          <p className="lead" data-reveal>{t('teaser.text')}</p>
          {fish && (
            <p className="teaser__count display" data-reveal>
              <b>{caught.length}</b><span>/{fish.length}</span>
              <small>{t('collection.caught')}</small>
            </p>
          )}
          <Link to="/tableau-de-chasse" className="btn blue" data-reveal>{t('teaser.cta')} <Arrow /></Link>
        </div>
        <div className="teaser__school">
          {shown.map((f, i) => {
            const v = fishVisual(f);
            return (
              <Link to={`/tableau-de-chasse/${f.slug}`} key={f.id} className={`teaser__fish teaser__fish--${i}`} data-reveal data-reveal-delay={i * 0.15}>
                <SwimmingFish src={v.src} aspect={v.aspect} period={3 + i * 0.6} alt={fishName(f, lang)} />
                {f.caught && <CaughtStamp />}
                <span className="teaser__name">{fishName(f, lang)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Videos() {
  const { t } = useTranslation();
  return (
    <section className="section videos">
      <div className="container">
        <span className="kicker" data-reveal>{t('videos.kicker')}</span>
        <h2 className="h2 display" data-reveal>{t('videos.title')}</h2>
        <div className="videos__grid">
          {SITE.videos.map((v, i) => (
            <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="video" data-reveal data-reveal-delay={(i % 3) * 0.1}>
              <div className="video__thumb">
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
                <span className="video__play"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
              </div>
              <p>{v.title}</p>
            </a>
          ))}
        </div>
        <div className="videos__more" data-reveal>
          <a className="btn ghost" href={SITE.socials.youtube} target="_blank" rel="noreferrer"><SocialIcon name="youtube" /> {t('videos.watch')}</a>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useTranslation();
  return (
    <section className="section final">
      <div className="container final__inner">
        <h2 className="display final__title" data-reveal>{t('cta.title')}</h2>
        <p className="lead" data-reveal>{t('cta.text')}</p>
        <Link to="/reservation" className="btn" data-reveal>{t('cta.button')} <Arrow /></Link>
      </div>
    </section>
  );
}

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();
  useReveal(ref, [i18n.resolvedLanguage]);
  return (
    <div ref={ref} className="home">
      <Hero />
      <Marquee />
      <Captain />
      <Season />
      <Experience />
      <Offer />
      <Teaser />
      <Videos />
      <FinalCta />
    </div>
  );
}
