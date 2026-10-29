import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  // "Thon & Marlin - la saison des géants." -> keep the glowing second half under the brush logo
  const [, ...rest] = t('hero.tagline').split(/\s+[-–—]\s+/);
  const tail = rest.join(' - ');
  // first sentence on its own line
  const [subA, subB] = t('hero.sub').split(/(?<=[.!?۔])\s+/, 2);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
      tl.from('.hero__kicker', { y: 16, opacity: 0, duration: 0.8 })
        .from('.hero__line > span', { y: 40, opacity: 0, filter: 'blur(14px)', duration: 1.3, stagger: 0.16, clearProps: 'filter' }, '-=0.5')
        .from('.hero__wave path', { strokeDashoffset: 600, duration: 1.4, ease: 'power2.inOut' }, '-=0.7')
        .from('.hero__sub, .hero__ctas, .hero__facts', { y: 20, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=1.1');
    },
    { scope: ref },
  );

  return (
    <section className="hero" ref={ref}>
      <div className="hero__scene">
        <Suspense fallback={null}><OceanScene /></Suspense>
      </div>
      <div className="hero__fade" />
      {/* fish-finder sonar pulsing behind the title */}
      <div className="hero__sonar" aria-hidden><i /><i /><i /></div>
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__kicker">{t('hero.kicker')}</p>
          <h1 className="hero__title">
            <span className="hero__line hero__line--brand">
              <span><img src="/img/omar-peche-vlog.webp" alt="Omar Pêche Vlog" width="718" height="190" /></span>
            </span>
            {tail && <span className="hero__line hero__line--glow"><span>{tail}</span></span>}
          </h1>
          <svg className="hero__wave" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden>
            <path d="M2 9 C 27 1, 52 1, 77 9 S 127 17, 152 9 S 202 1, 227 9 S 277 17, 298 9" />
          </svg>
          <p className="hero__sub">{subA}{subB && <><br />{subB}</>}</p>
          <div className="hero__ctas">
            <Link to="/reservation" className="btn">{t('hero.ctaBook')} <Arrow /></Link>
            <Link to="/tableau-de-chasse" className="btn ghost">{t('hero.ctaCollection')}</Link>
          </div>
          <ul className="hero__facts">
            <li><b>100K</b> {t('captain.followers')}</li>
            <li><b>{t('captain.igfaValue')}</b> {t('captain.igfa')}</li>
            <li><b>{SITE.pricePerPerson} {SITE.currency}</b> {t('offer.perPerson')}</li>
          </ul>
        </div>
      </div>
      <span className="hero__scroll" aria-hidden><i /></span>
    </section>
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
          <h2 className="h2" data-reveal>{t('captain.title')}</h2>
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
      gsap.fromTo('.season__img', { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
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
        <h2 className="h2" data-reveal>{t('season.title')}</h2>
        <p className="lead" data-reveal>{t('season.text')}</p>
      </div>
    </section>
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
        <h2 className="h2" data-reveal>{t('experience.title')}</h2>
        <div className="experience__grid">
          {(['jigging', 'trolling', 'livebait'] as const).map((k, i) => (
            <div key={k} data-reveal data-reveal-delay={i * 0.12}>
              <div className="tech glass">
                <svg viewBox="0 0 24 24" className="tech__icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{techIcons[k]}</svg>
                <h3>{t(`experience.${k}.t`)}</h3>
                <p>{t(`experience.${k}.d`)}</p>
              </div>
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
          <h2 className="h2">{t('offer.title')}</h2>
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
          <h2 className="h2" data-reveal>{t('teaser.title')}</h2>
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
        <h2 className="h2" data-reveal>{t('videos.title')}</h2>
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
        <h2 className="final__title" data-reveal>{t('cta.title')}</h2>
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
