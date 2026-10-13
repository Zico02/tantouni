import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../lib/api';
import { fishVisual } from '../lib/fishArt';
import type { Fish } from '../lib/types';
import XMark from '../components/XMark';
import FishForm from './FishForm';

export default function FishTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [list, setList] = useState<Fish[] | null>(null);
  const [editing, setEditing] = useState<Fish | 'new' | null>(null);
  const [q, setQ] = useState('');

  const load = () => api.fish().then(setList).catch(onAuthError);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return (list ?? []).filter((f) => !nq || f.names.fr.toLowerCase().includes(nq) || f.scientific.toLowerCase().includes(nq));
  }, [list, q]);
  const caught = (list ?? []).filter((f) => f.caught).length;

  const toggle = async (f: Fish) => {
    const next = { ...f, caught: !f.caught };
    setList((l) => l!.map((x) => (x.id === f.id ? next : x)));
    try { await api.updateFish(f.id, { caught: next.caught }); } catch (e) { onAuthError(e); load(); }
  };
  const remove = async (f: Fish) => {
    if (!confirm(`Supprimer « ${f.names.fr} » du tableau de chasse ?`)) return;
    try { await api.deleteFish(f.id); setList((l) => l!.filter((x) => x.id !== f.id)); } catch (e) { onAuthError(e); }
  };
  const move = async (f: Fish, dir: -1 | 1) => {
    if (!list) return;
    const i = list.findIndex((x) => x.id === f.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    const reordered = [...list];
    reordered[i] = { ...b, order: a.order };
    reordered[j] = { ...a, order: b.order };
    setList(reordered);
    try {
      await Promise.all([api.updateFish(a.id, { order: b.order }), api.updateFish(b.id, { order: a.order })]);
    } catch (e) { onAuthError(e); load(); }
  };
  const saved = (f: Fish) => {
    setList((l) => (l!.some((x) => x.id === f.id) ? l!.map((x) => (x.id === f.id ? f : x)) : [...l!, f]));
    setEditing(null);
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Tableau de chasse</h1>
          <p><b style={{ color: 'var(--sun)' }}>{caught}</b> / {list?.length ?? 0} espèces capturées · cochez une espèce dès que vous la sortez de l'eau !</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>+ Ajouter un poisson</button>
      </header>

      <div className="adm-filters">
        <input className="adm-input" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!list && <p className="adm-muted">Chargement…</p>}
      <div className="adm-fish">
        <AnimatePresence>
          {shown.map((f) => {
            const v = fishVisual(f);
            return (
              <motion.div layout key={f.id} className={`adm-fishrow ${f.caught ? 'is-caught' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
                <div className="adm-fishrow__img">
                  <img src={v.src} alt="" />
                  {f.caught && <XMark />}
                </div>
                <div className="adm-fishrow__name">
                  <b>{f.names.fr}</b>
                  <small>{f.scientific} · {{ legend: 'Légende', prized: 'Trophée', common: 'Classique' }[f.rarity]}{f.youtube ? ' · ▶ vidéo' : ''}{f.image ? ' · 📷 photo' : ''}</small>
                </div>
                <label className="adm-switch" title="Capturé ?">
                  <input type="checkbox" checked={f.caught} onChange={() => toggle(f)} />
                  <span className="adm-switch__track"><span /></span>
                  <em>{f.caught ? 'Capturé' : 'À capturer'}</em>
                </label>
                <div className="adm-fishrow__actions">
                  <button className="adm-icon-btn" title="Monter" onClick={() => move(f, -1)} disabled={!!q}>↑</button>
                  <button className="adm-icon-btn" title="Descendre" onClick={() => move(f, 1)} disabled={!!q}>↓</button>
                  <button className="btn ghost sm" onClick={() => setEditing(f)}>Modifier</button>
                  <button className="adm-icon-btn" title="Supprimer" onClick={() => remove(f)}>🗑</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editing && (
          <FishForm key="form" fish={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} onAuthError={onAuthError} />
        )}
      </AnimatePresence>
    </div>
  );
}
