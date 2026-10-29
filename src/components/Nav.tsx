import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { LANGS } from '../i18n/locales';
import './Nav.css';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="TANTOUNI - Omar Pêche Vlog">
      <img src="/img/logo-tantouni.webp" alt="TANTOUNI" className="logo__img" width="900" height="454" />
    </Link>
  );
}

function LangSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === i18n.resolvedLanguage) ?? LANGS[0];

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="lang" ref={ref}>
      <button className="lang__btn" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </svg>
        {current.short}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="lang__menu glass"
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === current.code}
                  className={l.code === current.code ? 'is-active' : ''}
                  onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
                >
                  <span>{l.label}</span><small>{l.short}</small>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  const links = (
    <>
      <NavLink to="/" end>{t('nav.home')}</NavLink>
      <NavLink to="/reservation">{t('nav.book')}</NavLink>
      <NavLink to="/tableau-de-chasse">{t('nav.collection')}</NavLink>
      <NavLink to="/palmares">{t('nav.achievements')}</NavLink>
    </>
  );

  return (
    <header className={`nav ${scrolled || menu ? 'is-scrolled' : ''}`}>
      <div className="nav__inner">
        <Logo />
        <nav className="nav__links">{links}</nav>
        <div className="nav__actions">
          <LangSwitcher />
          <Link to="/reservation" className="btn sm nav__cta">{t('nav.bookCta')}</Link>
          <button className={`nav__burger ${menu ? 'is-open' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
            <span /><span />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav
            className="nav__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {links}
            <Link to="/reservation" className="btn">{t('nav.bookCta')}</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
