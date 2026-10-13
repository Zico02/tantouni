import { useCallback, useState, type FormEvent } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'motion/react';
import { adminToken, api, ApiError } from '../lib/api';
import { Logo } from '../components/Nav';
import ReservationsTab from './ReservationsTab';
import AvailabilityTab from './AvailabilityTab';
import FishTab from './FishTab';
import AchievementsTab from './AchievementsTab';
import './Admin.css';

// Captain's area. Kept in French on purpose: it's Omar's tool, not a public page.

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const { token } = await api.login(pw);
      adminToken.set(token);
      onDone();
    } catch (e) {
      setErr(e instanceof ApiError && e.message === 'admin_disabled'
        ? 'Connexion désactivée : ADMIN_PASSWORD manque dans le fichier .env du serveur.'
        : 'Mot de passe incorrect.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-login">
      <motion.form className="adm-login__card glass" onSubmit={submit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Logo />
        <h1 className="display">Espace capitaine</h1>
        <p>Réservations, disponibilités et tableau de chasse.</p>
        <div className="field">
          <label htmlFor="pw">Mot de passe</label>
          <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        </div>
        {err && <p className="adm-err">{err}</p>}
        <button className="btn" disabled={busy || !pw}>{busy ? 'Connexion…' : 'Entrer'}</button>
        <Link to="/" className="adm-back">← Retour au site</Link>
      </motion.form>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));
  const onAuthError = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) setAuthed(false);
  }, []);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="adm">
      <aside className="adm__side">
        <Logo />
        <nav className="adm__nav">
          <NavLink to="/admin/reservations"><Icon d="M4 6h16M4 12h16M4 18h10" />Réservations</NavLink>
          <NavLink to="/admin/disponibilites"><Icon d="M4 5h16v15H4zM4 10h16M9 3v4M15 3v4" />Disponibilités</NavLink>
          <NavLink to="/admin/poissons"><Icon d="M3 12c4-6 11-7 16-3l3-3-1 6 1 6-3-3c-5 4-12 3-16-3z" />Tableau de chasse</NavLink>
          <NavLink to="/admin/palmares"><Icon d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />Palmarès</NavLink>
        </nav>
        <div className="adm__foot">
          <Link to="/" className="btn ghost sm">Voir le site ↗</Link>
          <button className="btn ghost sm" onClick={() => { adminToken.clear(); setAuthed(false); }}>Déconnexion</button>
        </div>
      </aside>
      <section className="adm__main" data-lenis-prevent>
        <Routes>
          <Route index element={<Navigate to="reservations" replace />} />
          <Route path="reservations" element={<ReservationsTab onAuthError={onAuthError} />} />
          <Route path="disponibilites" element={<AvailabilityTab onAuthError={onAuthError} />} />
          <Route path="poissons" element={<FishTab onAuthError={onAuthError} />} />
          <Route path="palmares" element={<AchievementsTab onAuthError={onAuthError} />} />
          <Route path="*" element={<Navigate to="reservations" replace />} />
        </Routes>
      </section>
    </div>
  );
}

export const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

export const frDate = (d: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('fr-FR', opts).format(new Date(d + 'T12:00:00'));
export const dh = (n: number) => `${n.toLocaleString('fr-FR')} DH`;
