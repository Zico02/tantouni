import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwimmingFish from '../components/SwimmingFish';
import BoatSeats from '../components/BoatSeats';
import CaughtStamp from '../components/CaughtStamp';
import { Arrow, Check } from '../components/icons';
import { SocialIcon } from '../components/Footer';
import { gsap, ScrollTrigger, useGSAP, useReveal } from '../lib/motion';
import Jig from '../components/Jig';
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
      {/* scroll hint: a spinning reel being reeled in (handle turns, line lays on the spool) */}
      <span className="hero__scroll" aria-hidden>
        <svg viewBox="420 185 440 465" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke="#8fa0b8" strokeWidth="14">
            {/* reel foot + stem */}
            <rect x="612" y="198" width="196" height="26" rx="13" />
            <path d="M700 224c0 60-14 96-4 150M728 224c4 70 30 118 80 160 34 30 40 70 18 96-16 18-46 24-78 24h-60" />
            {/* bail arm around the rotor */}
            <path d="M560 300c-30-12-56-10-62 6-6 16 18 28 18 28v232s-18 14-6 30c10 14 40 8 70-6" />
            <path d="M520 334h96c46 0 78 30 78 86v40c0 58-32 90-80 90h-96" />
            {/* rotor + spool + front cap */}
            <rect x="552" y="368" width="96" height="152" rx="14" />
            <path d="M552 392h-78v104h78" />
            <path d="M474 384c-28 2-42 34-42 60 0 28 14 58 42 60" />
            <path d="M488 376v136" />
          </g>
          {/* line laying on the spool */}
          <rect className="reel__lay" x="576" y="392" width="30" height="12" rx="6" fill="#f2c230" />
          {/* the handle turning */}
          <g className="reel__handle" stroke="#f2c230" strokeWidth="14">
            <circle cx="760" cy="436" r="26" />
            <path d="M746 458L694 600" />
            <rect x="644" y="598" width="96" height="36" rx="18" />
          </g>
        </svg>
      </span>
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

      // The jig: hangs straight under the scroll-mouse (page centre, see CSS) and sinks as you
      // scroll the section. Halfway down the slim jig is swapped for a heavier one, and the
      // water gets darker the deeper it goes.
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top 75%', end: 'bottom 20%', scrub: 0.8, invalidateOnRefresh: true },
      });
      tl.fromTo(q('.jig-rig'), { y: () => section.offsetHeight * 0.04 }, { y: () => Math.max(section.offsetHeight * 0.3, section.offsetHeight - (window.innerWidth < 900 ? 220 : 340)), duration: 1 }, 0)
        .fromTo(q('.captain__light'), { opacity: 1 }, { opacity: 0.1, duration: 1 }, 0)
        .fromTo(q('.captain__deep'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
        // the swap: one jig becomes the other in a blink (no flash, no zoom)
        .to(q('.jig-rig__jig--slim'), { opacity: 0, duration: 0.012 }, 0.5)
        .fromTo(q('.jig-rig__jig--heavy'), { opacity: 0 }, { opacity: 1, duration: 0.012 }, 0.5);
      // a quick extra kick while scrolling, like a jig being worked
      const tilt = gsap.quickTo(q('.jig-rig__body')[0], 'rotation', { duration: 0.5, ease: 'power3.out' });
      ScrollTrigger.create({
        trigger: section, start: 'top bottom', end: 'bottom top',
        onUpdate: (st) => tilt(gsap.utils.clamp(-14, 14, st.getVelocity() / 120)),
      });
    },
    { scope: ref },
  );
  return (
    <section className="section captain" ref={ref}>
      <div className="captain__light" aria-hidden />
      <div className="captain__deep" aria-hidden />
      <div className="jig-rig" aria-hidden>
        <span className="jig-rig__line" />
        <div className="jig-rig__body">
          <Jig model="slim" className="jig-rig__jig jig-rig__jig--slim" />
          <Jig model="heavy" className="jig-rig__jig jig-rig__jig--heavy" />
        </div>
      </div>
      <div className="container captain__grid">
        <div className="captain__text">
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
      <div className="season__media">
        <img className="season__img" src="/img/season-of-giants.webp" alt="Chasseur de géants" />
        <div className="season__shade" />
      </div>
    </section>
  );
}

// "La saison des géants": the three headline species, each card opens its fish on the board
const GIANTS = [
  { k: 'tuna', slug: 'thon-rouge-atlantique' },
  { k: 'marlin', slug: 'marlin-blanc' },
  { k: 'amberjack', slug: 'seriole' },
] as const;

function Giants() {
  const { t } = useTranslation();
  return (
    <section className="section giants">
      <div className="giants__sea" aria-hidden>
        <img src="/img/giants/sea.webp" alt="" loading="lazy" />
      </div>
      <div className="container giants__inner">
        <span className="kicker giants__kicker" data-reveal>{t('season.kicker')}</span>
        <h2 className="h2 giants__title" data-reveal>
          {t('season.title1')} <em>{t('season.hl')}</em>
        </h2>
        {/* the species on one line, the sentence on the next */}
        <p className="lead giants__lead" data-reveal>
          {t('season.text').split(/(?<=…)\s+/).map((part, i) => <span key={i} className="giants__lead-line">{part}</span>)}
        </p>
        <div className="experience__grid giants__grid">
          {GIANTS.map(({ k, slug }, i) => (
            <div key={k} data-reveal data-reveal-delay={i * 0.12}>
              <article className={`tech giant giant--${k}`}>
                <img className="tech__photo" src={`/img/giants/${k}.webp`} alt="" loading="lazy" />
                <h3>{t(`season.${k}.t`)}</h3>
                <p>{t(`season.${k}.d`)}</p>
                <Link to={`/tableau-de-chasse/${slug}`} className="tech__more">{t('season.more')} <Arrow /></Link>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const { t } = useTranslation();
  return (
    <section className="section experience">
      {/* underwater backdrop: sunlit surface and a tuna swimming by */}
      <div className="experience__sea" aria-hidden>
        <img src="/img/experience/sea.webp" alt="" loading="lazy" />
      </div>
      <div className="container experience__inner">
        <span className="kicker experience__kicker" data-reveal>{t('experience.kicker')}</span>
        <h2 className="h2 experience__title" data-reveal>
          {t('experience.title1')}<br />
          {t('experience.title2')} <em>{t('experience.hl')}</em>
        </h2>
        <span className="experience__rule" data-reveal />
        <div className="experience__grid">
          {(['jigging', 'trolling', 'livebait'] as const).map((k, i) => (
            <div key={k} data-reveal data-reveal-delay={i * 0.12}>
              <article className={`tech tech--${k}`}>
                <img className="tech__photo" src={`/img/experience/${k}.webp`} alt="" loading="lazy" />
                <span className="tech__icon">
                  <img src={`/img/experience/icon-${k}.png`} alt="" />
                </span>
                <h3>{t(`experience.${k}.t`)}</h3>
                <p>{t(`experience.${k}.d`)}</p>
                {/* the link also covers the whole card (see .tech__more::after) */}
                <Link to="/reservation" className="tech__more">{t('experience.more')} <Arrow /></Link>
              </article>
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
  const fish = useFish().fish?.filter((f) => !f.bait); // baits aren't on the board
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
            // on this teaser the meagre goes by its Moroccan name, "Courbine"
            const name = f.slug === 'courbine' && lang === 'fr' ? 'Courbine' : fishName(f, lang);
            return (
              <Link to={`/tableau-de-chasse/${f.slug}`} key={f.id} className={`teaser__fish teaser__fish--${i}`} data-reveal data-reveal-delay={i * 0.15}>
                <SwimmingFish src={v.src} aspect={v.aspect} period={3 + i * 0.6} alt={name} />
                {f.caught && <CaughtStamp />}
                <span className="teaser__name">{name}</span>
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
      <Giants />
      <Season />
      <Experience />
      <Teaser />
      <Offer />
      <Videos />
      <FinalCta />
    </div>
  );
}
