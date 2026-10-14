import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { FISH_SHAPES, fishVisual } from '../lib/fishArt';
import { scrollLock } from '../lib/motion';
import { youtubeId } from '../lib/site';
import { LANGS } from '../i18n/locales';
import { SEAS, type Fish, type FishArt, type Habitat, type Lang, type Sea, type Technique } from '../lib/types';
import SwimmingFish from '../components/SwimmingFish';
import CaughtStamp from '../components/CaughtStamp';

const HABITATS: Record<Habitat, string> = { pelagic: 'Large (pélagique)', reef: 'Roches & récifs', coastal: 'Côtier', surf: 'Plages & estuaires' };
const TECHS: Record<Technique, string> = { jigging: 'Jigging', trolling: 'Traîne', livebait: 'Vif', popping: 'Popping', spinning: 'Lancer', bottom: 'Fond' };
const SHAPE_FR: Record<string, string> = {
  tuna: 'Thon', marlin: 'Marlin', sword: 'Espadon', sailfish: 'Voilier', shark: 'Requin', grouper: 'Mérou', bream: 'Dorade / Sar',
  bass: 'Bar / Loup', barracuda: 'Barracuda', mahi: 'Coryphène', jack: 'Sériole / Carangue', corvina: 'Courbine', wahoo: 'Wahoo',
};
const PATTERNS: [keyof FishArt, string][] = [
  ['stripe', 'Bande latérale'], ['backStripes', 'Rayures dos'], ['bars', 'Barres verticales'], ['spots', 'Points'],
  ['blotches', 'Taches'], ['goldBand', 'Bandeau doré'], ['band', 'Bande oculaire'], ['wavyLine', 'Ligne ondulée'], ['longPec', 'Longues pectorales'], ['deep', 'Corps haut'],
];
const SEA_FR: Record<Sea, string> = { atlantique: 'Océan Atlantique', mediterranee: 'Mer Méditerranée', 'mer-rouge': 'Mer Rouge', 'mer-oman': "Golfe d'Oman", golfe: 'Golfe Persique', indonesie: 'Océan Indien' };
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const blank = (): Omit<Fish, 'id' | 'order'> => ({
  slug: '', names: { fr: '', en: '', ar: '', es: '', it: '' }, nickname: '', scientific: '',
  maxLength: null, maxWeight: null, depth: '', habitat: [], techniques: [], season: [],
  description: { fr: '', en: '' }, caught: false, catch: { date: '', weight: '', length: '', location: '', notes: '' },
  youtube: '', image: '', rarity: 'common', zone: 'maroc', seas: ['atlantique'],
  art: { shape: 'tuna', back: '#13315c', belly: '#e6edf3', fin: '#1d4f91', accent: '#5aa0e6' },
});

interface Props { fish: Fish | null; onClose: () => void; onSaved: (f: Fish) => void; onAuthError: (e: unknown) => void }

export default function FishForm({ fish, onClose, onSaved, onAuthError }: Props) {
  const [f, setF] = useState(() => (fish ? structuredClone(fish) : { ...blank(), id: '', order: 0 } as Fish));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [descLang, setDescLang] = useState<Lang>('fr');

  useEffect(() => { scrollLock.lock(); return () => scrollLock.unlock(); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const set = <K extends keyof Fish>(k: K, v: Fish[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const visual = useMemo(() => fishVisual({ slug: f.slug || f.names.fr || 'preview', image: f.image, art: f.art }), [f.slug, f.names.fr, f.image, f.art]);
  const yt = youtubeId(f.youtube);

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { const { url } = await api.upload(file); set('image', url); } catch (e) { onAuthError(e); setErr("Échec de l'envoi de la photo (PNG/JPG/WebP, 10 Mo max)."); }
    setUploading(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.names.fr.trim()) { setErr('Le nom français est obligatoire.'); return; }
    if (f.youtube && !yt) { setErr('Le lien YouTube ne semble pas valide.'); return; }
    setBusy(true);
    setErr('');
    const { id, ...body } = f;
    try {
      const out = fish ? await api.updateFish(id, body) : await api.createFish(body);
      onSaved(out);
    } catch (e) { onAuthError(e); setErr("Impossible d'enregistrer."); }
    setBusy(false);
  };

  const num = (v: string) => (v === '' ? null : Number(v));

  return (
    <motion.div className="adm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        className="adm-modal__panel"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        data-lenis-prevent
      >
        <header className="adm-modal__head">
          <h2 className="display">{fish ? `Modifier · ${fish.names.fr}` : 'Nouveau poisson'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose}>✕</button>
        </header>

        <div className="adm-form">
          <div className="adm-form__preview">
            <div className="adm-preview">
              <span className="adm-preview__ghost display">{(f.nickname || f.names.en || f.names.fr || 'TANTOUNI').toUpperCase()}</span>
              <SwimmingFish key={visual.src} src={visual.src} aspect={visual.aspect} />
              {f.caught && <CaughtStamp key={String(f.caught)} />}
            </div>
            <label className={`adm-caught ${f.caught ? 'is-on' : ''}`}>
              <input type="checkbox" checked={f.caught} onChange={(e) => set('caught', e.target.checked)} />
              <span>{f.caught ? '✓ Capturé : TANTOUNI !' : 'Pas encore capturé'}</span>
            </label>

            <fieldset className="adm-fs">
              <legend>Photo</legend>
              <p className="adm-hint">Idéal : PNG détouré (fond transparent), poisson vu de profil, tête à gauche. Sinon une illustration est générée.</p>
              <div className="adm-upload">
                <label className="btn ghost sm">
                  {uploading ? 'Envoi…' : f.image ? 'Changer la photo' : 'Téléverser une photo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {f.image && <button type="button" className="btn ghost sm" onClick={() => set('image', '')}>Retirer la photo</button>}
              </div>
            </fieldset>

            {!f.image && (
              <fieldset className="adm-fs">
                <legend>Illustration</legend>
                <div className="field">
                  <label>Silhouette</label>
                  <select value={f.art.shape} onChange={(e) => set('art', { ...f.art, shape: e.target.value as FishArt['shape'] })}>
                    {FISH_SHAPES.map((s) => <option key={s} value={s}>{SHAPE_FR[s] ?? s}</option>)}
                  </select>
                </div>
                <div className="adm-colors">
                  {(['back', 'belly', 'fin', 'accent'] as const).map((k) => (
                    <label key={k}>
                      <input type="color" value={f.art[k]} onChange={(e) => set('art', { ...f.art, [k]: e.target.value })} />
                      <span>{{ back: 'Dos', belly: 'Ventre', fin: 'Nageoires', accent: 'Motifs' }[k]}</span>
                    </label>
                  ))}
                </div>
                <div className="adm-checks">
                  {PATTERNS.map(([k, label]) => (
                    <label key={k}><input type="checkbox" checked={Boolean(f.art[k])} onChange={(e) => set('art', { ...f.art, [k]: e.target.checked })} />{label}</label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div className="adm-form__fields">
            <fieldset className="adm-fs">
              <legend>Noms</legend>
              <div className="adm-grid2">
                {LANGS.map((l) => (
                  <div className="field" key={l.code}>
                    <label>{l.label}{l.code === 'fr' && ' *'}</label>
                    <input dir={l.code === 'ar' ? 'rtl' : 'ltr'} value={f.names[l.code] || ''} required={l.code === 'fr'} onChange={(e) => set('names', { ...f.names, [l.code]: e.target.value })} />
                  </div>
                ))}
                <div className="field"><label>Surnom (gros texte derrière le poisson)</label><input value={f.nickname || ''} onChange={(e) => set('nickname', e.target.value)} placeholder="TANTOUNI, DOGTOOTH…" /></div>
              </div>
              <div className="adm-grid2">
                <div className="field"><label>Nom scientifique</label><input value={f.scientific} onChange={(e) => set('scientific', e.target.value)} /></div>
                <div className="field">
                  <label>Rareté</label>
                  <select value={f.rarity} onChange={(e) => set('rarity', e.target.value as Fish['rarity'])}>
                    <option value="common">Classique</option><option value="prized">Trophée</option><option value="legend">Légende</option>
                  </select>
                </div>
                <div className="field">
                  <label>Zone</label>
                  <select value={f.zone} onChange={(e) => set('zone', e.target.value as Fish['zone'])}>
                    <option value="maroc">Maroc</option><option value="monde">Monde</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>La prise d'Omar</legend>
              <div className="field">
                <label>Lien YouTube de la vidéo</label>
                <input dir="ltr" value={f.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
              </div>
              {yt && <img className="adm-ytthumb" src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`} alt="" />}
              <div className="adm-grid2">
                <div className="field"><label>Date</label><input type="date" value={f.catch.date} onChange={(e) => set('catch', { ...f.catch, date: e.target.value })} /></div>
                <div className="field"><label>Poids</label><input value={f.catch.weight} onChange={(e) => set('catch', { ...f.catch, weight: e.target.value })} placeholder="ex. 120 kg" /></div>
                <div className="field"><label>Taille</label><input value={f.catch.length} onChange={(e) => set('catch', { ...f.catch, length: e.target.value })} placeholder="ex. 1,80 m" /></div>
                <div className="field"><label>Lieu</label><input value={f.catch.location} onChange={(e) => set('catch', { ...f.catch, location: e.target.value })} placeholder="Mohammedia, Dakhla…" /></div>
              </div>
              <div className="field"><label>Notes</label><input value={f.catch.notes} onChange={(e) => set('catch', { ...f.catch, notes: e.target.value })} placeholder="Technique, leurre, durée du combat…" /></div>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>Fiche espèce</legend>
              <div className="adm-desc-tabs">
                {LANGS.map((l) => (
                  <button type="button" key={l.code} className={descLang === l.code ? 'is-on' : ''} onClick={() => setDescLang(l.code)}>
                    {l.short}{f.description[l.code] ? ' •' : ''}
                  </button>
                ))}
              </div>
              <div className="field">
                <label>Description ({LANGS.find((l) => l.code === descLang)!.label}) - si vide, le français/anglais est affiché</label>
                <textarea dir={descLang === 'ar' ? 'rtl' : 'ltr'} value={f.description[descLang] || ''} onChange={(e) => set('description', { ...f.description, [descLang]: e.target.value })} />
              </div>
              <div className="adm-grid3">
                <div className="field"><label>Taille max. (cm)</label><input type="number" min="0" value={f.maxLength ?? ''} onChange={(e) => set('maxLength', num(e.target.value))} /></div>
                <div className="field"><label>Poids max. (kg)</label><input type="number" min="0" step="0.1" value={f.maxWeight ?? ''} onChange={(e) => set('maxWeight', num(e.target.value))} /></div>
                <div className="field"><label>Profondeur</label><input value={f.depth} onChange={(e) => set('depth', e.target.value)} placeholder="0 – 200 m" /></div>
              </div>
              <div className="adm-checks">
                <b>Mers :</b>
                {SEAS.map((x) => <label key={x}><input type="checkbox" checked={(f.seas ?? []).includes(x)} onChange={() => set('seas', toggleIn(f.seas ?? [], x))} />{SEA_FR[x]}</label>)}
              </div>
              <div className="adm-checks">
                <b>Famille :</b>
                <label><input type="checkbox" checked={f.group === 'shark'} onChange={(e) => set('group', e.target.checked ? 'shark' : undefined)} />Requin (apparaît dans le filtre « Requins »)</label>
              </div>
              <div className="adm-checks">
                <b>Habitat :</b>
                {(Object.keys(HABITATS) as Habitat[]).map((h) => <label key={h}><input type="checkbox" checked={f.habitat.includes(h)} onChange={() => set('habitat', toggleIn(f.habitat, h))} />{HABITATS[h]}</label>)}
              </div>
              <div className="adm-checks">
                <b>Techniques :</b>
                {(Object.keys(TECHS) as Technique[]).map((h) => <label key={h}><input type="checkbox" checked={f.techniques.includes(h)} onChange={() => set('techniques', toggleIn(f.techniques, h))} />{TECHS[h]}</label>)}
              </div>
              <div className="adm-months">
                <b>Saison :</b>
                {MONTHS.map((m, i) => (
                  <button type="button" key={i} className={f.season.includes(i + 1) ? 'is-on' : ''} onClick={() => set('season', toggleIn(f.season, i + 1).sort((a, b) => a - b))} title={String(i + 1)}>{m}</button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <footer className="adm-modal__foot">
          {err && <p className="adm-err">{err}</p>}
          <button type="button" className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn" disabled={busy}>{busy ? 'Enregistrement…' : fish ? 'Enregistrer' : 'Ajouter au tableau'}</button>
        </footer>
      </motion.form>
    </motion.div>
  );
}
