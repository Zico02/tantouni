import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE } from '../lib/site';
import { Logo } from './Nav';
import './Footer.css';

export const SocialIcon = ({ name }: { name: 'youtube' | 'instagram' | 'facebook' }) => {
  const paths = {
    youtube: <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM10 15.1V8.9l5.2 3.1L10 15.1z" fill="currentColor" />,
    instagram: <g fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1" fill="currentColor" /></g>,
    facebook: <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.6V13h2.8v8h3.1z" fill="currentColor" />,
  };
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>{paths[name]}</svg>;
};

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer__giant display outline-text" aria-hidden>TANTOUNI</div>
      <div className="container footer__grid">
        <div>
          <Logo />
          <p className="footer__port">{SITE.port} · Maroc</p>
        </div>
        <nav className="footer__links">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/reservation">{t('nav.book')}</Link>
          <Link to="/tableau-de-chasse">{t('nav.collection')}</Link>
          <Link to="/palmares">{t('nav.achievements')}</Link>
          <Link to="/admin">{t('footer.admin')}</Link>
        </nav>
        <div>
          <p className="footer__follow">{t('footer.follow')}</p>
          <div className="footer__social">
            {(Object.keys(SITE.socials) as (keyof typeof SITE.socials)[]).map((k) => (
              <a key={k} href={SITE.socials[k]} target="_blank" rel="noreferrer" aria-label={k}><SocialIcon name={k} /></a>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Omar Pêche Vlog · {t('footer.rights')}</span>
        <span>{SITE.pricePerPerson} {SITE.currency} / pers · {SITE.boats} × {SITE.seatsPerBoat}</span>
      </div>
    </footer>
  );
}
