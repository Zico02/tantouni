import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../lib/api';
import { scrollLock } from '../lib/motion';
import { LANGS } from '../i18n/locales';
import type { Achievement, Lang } from '../lib/types';
import { frDate } from './Admin';

const blank = (): Achievement => ({
  id: '', date: '', place: null, award: {}, title: {}, location: '', organizer: '', description: {}, photos: [], video: '',
});

function AchForm({ item, onClose, onSaved, onAuthError }: { item: Achievement | null; onClose: () => void; onSaved: (a: Achievement) => void; onAuthError: (e: unknown) => void }) {
  const [a, setA] = useState<Achievement>(() => (item ? structuredClone(item) : blank()));
  const [lang, setLang] = useState<Lang>('fr');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState('');

  useEffect(() => { scrollLock.lock(); return () => scrollLock.unlock(); }, []);
  const set = <K extends keyof Achievement>(k: K, v: Achievement[K]) => setA((p) => ({ ...p, [k]: v }));
  const setL = (k: 'title' | 'award' | 'description', v: string) => setA((p) => ({ ...p, [k]: { ...p[k], [lang]: v } }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    setUploading(list.length);
    for (const f of list) {
      try {
        const { url } = await api.upload(f);
        setA((p) => ({ ...p, photos: [...p.photos, url] }));
      } catch (e) { onAuthError(e); setErr("Une photo n'a pas pu être envoyée (PNG/JPG/WebP, 10 Mo max)."); }
      setUploading((n) => n - 1);
    }
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= a.photos.length) return;
    const p = [...a.photos];
    [p[i], p[j]] = [p[j], p[i]];
    set('photos', p);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!a.title.fr?.trim()) { setErr('Le titre en français est obligatoire.'); setLang('fr'); return; }
    setBusy(true);
    setErr('');
    const { id, ...body } = a;
    try {
      onSaved(item ? await api.updateAchievement(id, body) : await api.createAchievement(body));
    } catch (e) { onAuthError(e); setErr("Impossible d'enregistrer."); }
    setBusy(false);
  };

  return (
    <motion.div className="adm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="adm-modal__panel" onSubmit={submit} onClick={(e) => e.stopPropagation()} initial={{ y: 40 }} animate={{ y: 0 }} data-lenis-prevent>
        <header className="adm-modal__head">
          <h2 className="display">{item ? 'Modifier le trophée' : 'Nouveau trophée'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose}>✕</button>
        </header>
        <div className="adm-form adm-form--ach">
          <div className="adm-form__fields">
            <fieldset className="adm-fs">
              <legend>Compétition</legend>
              <div className="adm-grid3">
                <div className="field"><label>Date</label><input type="date" value={a.date} onChange={(e) => set('date', e.target.value)} /></div>
                <div className="field">
                  <label>Classement</label>
                  <select value={a.place ?? ''} onChange={(e) => set('place', e.target.value ? Number(e.target.value) : null)}>
                    <option value="">- (pas de place)</option>
                    {Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1 === 1 ? '1er 🥇' : i + 1 === 2 ? '2ᵉ 🥈' : i + 1 === 3 ? '3ᵉ 🥉' : `${i + 1}ᵉ`}</option>)}
                  </select>
                </div>
                <div className="field"><label>Lieu</label><input value={a.location} onChange={(e) => set('location', e.target.value)} placeholder="Jebel Sifah, Oman" /></div>
              </div>
              <div className="field"><label>Organisateur / label</label><input value={a.organizer} onChange={(e) => set('organizer', e.target.value)} placeholder="IGFA…" /></div>
              <div className="field"><label>Lien vidéo YouTube (facultatif)</label><input dir="ltr" value={a.video || ''} onChange={(e) => set('video', e.target.value)} /></div>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>Textes</legend>
              <div className="adm-desc-tabs">
                {LANGS.map((l) => (
                  <button type="button" key={l.code} className={lang === l.code ? 'is-on' : ''} onClick={() => setLang(l.code)}>
                    {l.short}{a.title[l.code] ? ' •' : ''}
                  </button>
                ))}
              </div>
              <p className="adm-hint">Si une langue est vide, le texte français est affiché.</p>
              <div className="field"><label>Titre de la compétition{lang === 'fr' && ' *'}</label><input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={a.title[lang] || ''} onChange={(e) => setL('title', e.target.value)} /></div>
              <div className="field"><label>Récompense</label><input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={a.award[lang] || ''} onChange={(e) => setL('award', e.target.value)} placeholder="2ᵉ place par équipe" /></div>
              <div className="field"><label>Description</label><textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={5} value={a.description[lang] || ''} onChange={(e) => setL('description', e.target.value)} /></div>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>Photos ({a.photos.length})</legend>
              <p className="adm-hint">La première photo est la plus grande. Utilisez les flèches pour changer l'ordre.</p>
              <div className="adm-photos">
                {a.photos.map((p, i) => (
                  <div key={p} className="adm-photo">
                    <img src={p} alt="" />
                    <div>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === a.photos.length - 1}>→</button>
                      <button type="button" onClick={() => set('photos', a.photos.filter((x) => x !== p))}>🗑</button>
                    </div>
                  </div>
                ))}
                <label className="adm-photo adm-photo--add">
                  {uploading ? `Envoi… (${uploading})` : '+ Ajouter des photos'}
                  <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files)} />
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        <footer className="adm-modal__foot">
          {err && <p className="adm-err">{err}</p>}
          <button type="button" className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn" disabled={busy || uploading > 0}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </footer>
      </motion.form>
    </motion.div>
  );
}

export default function AchievementsTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [list, setList] = useState<Achievement[] | null>(null);
  const [editing, setEditing] = useState<Achievement | 'new' | null>(null);
  useEffect(() => { api.achievements().then(setList).catch(onAuthError); }, [onAuthError]);

  const remove = async (a: Achievement) => {
    if (!confirm(`Supprimer « ${a.title.fr} » du palmarès ?`)) return;
    try { await api.deleteAchievement(a.id); setList((l) => l!.filter((x) => x.id !== a.id)); } catch (e) { onAuthError(e); }
  };
  const saved = (a: Achievement) => {
    setList((l) => [...(l ?? []).filter((x) => x.id !== a.id), a].sort((x, y) => (y.date || '').localeCompare(x.date || '')));
    setEditing(null);
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Palmarès</h1>
          <p>Compétitions, podiums et trophées affichés sur la page « Palmarès » du site.</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>+ Ajouter un trophée</button>
      </header>
      {!list && <p className="adm-muted">Chargement…</p>}
      {list?.length === 0 && <div className="adm-empty">Aucun trophée pour l'instant. 🏆</div>}
      <div className="adm-achs">
        {list?.map((a) => (
          <div key={a.id} className="adm-ach">
            <div className="adm-ach__img">{a.photos[0] ? <img src={a.photos[0]} alt="" /> : '🏆'}</div>
            <div className="adm-ach__txt">
              <b>{a.title.fr}</b>
              <small>{[a.award.fr, a.location, a.date && frDate(a.date, { day: 'numeric', month: 'long', year: 'numeric' })].filter(Boolean).join(' · ')}</small>
              <small>{a.photos.length} photo(s)</small>
            </div>
            <div className="adm-fishrow__actions">
              <button className="btn ghost sm" onClick={() => setEditing(a)}>Modifier</button>
              <button className="adm-icon-btn" onClick={() => remove(a)} title="Supprimer">🗑</button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {editing && <AchForm key="f" item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} onAuthError={onAuthError} />}
      </AnimatePresence>
    </div>
  );
}
