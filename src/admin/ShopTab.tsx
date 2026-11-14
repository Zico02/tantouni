import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../lib/api';
import { scrollLock } from '../lib/motion';
import { LANGS } from '../i18n/locales';
import type { Lang, Order, OrderStatus, Product, ProductCategory } from '../lib/types';
import { dh } from './Admin';

const STATUS: Record<OrderStatus, string> = { new: 'Nouvelle', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée ✓', cancelled: 'Annulée' };
const CATS: Record<ProductCategory, string> = { hoodie: 'Hoodie', hat: 'Bob / chapeau', cap: 'Casquette', balaclava: 'Cagoule' };
const APPAREL = ['S', 'M', 'L', 'XL', 'XXL'];

const wa = (phone: string) => {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '212' + d.slice(1);
  return `https://wa.me/${d}`;
};
const when = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

const blank = (): Product => ({
  id: '', slug: '', order: 0, category: 'hoodie', name: {}, description: {}, price: 0, oldPrice: null,
  images: [], sizes: APPAREL, badge: {}, soldOut: false, fit: 'cover', focus: '',
});

function ProductForm({ item, onClose, onSaved, onAuthError }: { item: Product | null; onClose: () => void; onSaved: (p: Product) => void; onAuthError: (e: unknown) => void }) {
  const [p, setP] = useState<Product>(() => (item ? structuredClone(item) : blank()));
  const [lang, setLang] = useState<Lang>('fr');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState('');
  useEffect(() => { scrollLock.lock(); return () => scrollLock.unlock(); }, []);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const setL = (k: 'name' | 'description' | 'badge', v: string) => setP((x) => ({ ...x, [k]: { ...x[k], [lang]: v } }));
  const oneSize = p.sizes.length === 1 && p.sizes[0] === 'TU';

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    setUploading(list.length);
    for (const f of list) {
      try {
        const { url } = await api.upload(f);
        setP((x) => ({ ...x, images: [...x.images, url] }));
      } catch (e) { onAuthError(e); setErr("Une photo n'a pas pu être envoyée (PNG/JPG/WebP, 10 Mo max)."); }
      setUploading((n) => n - 1);
    }
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= p.images.length) return;
    const l = [...p.images];
    [l[i], l[j]] = [l[j], l[i]];
    set('images', l);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!p.name.fr?.trim()) { setErr('Le nom en français est obligatoire.'); setLang('fr'); return; }
    if (!(p.price > 0)) { setErr('Indiquez un prix.'); return; }
    if (!p.sizes.length) { setErr('Choisissez au moins une taille (ou « Taille unique »).'); return; }
    setBusy(true);
    setErr('');
    const { id, ...body } = p;
    try {
      onSaved(item ? await api.updateProduct(id, body) : await api.createProduct(body));
    } catch (e) { onAuthError(e); setErr("Impossible d'enregistrer."); }
    setBusy(false);
  };

  return (
    <motion.div className="adm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="adm-modal__panel" onSubmit={submit} onClick={(e) => e.stopPropagation()} initial={{ y: 40 }} animate={{ y: 0 }} data-lenis-prevent>
        <header className="adm-modal__head">
          <h2 className="display">{item ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose}>✕</button>
        </header>
        <div className="adm-form adm-form--ach">
          <div className="adm-form__fields">
            <fieldset className="adm-fs">
              <legend>Produit</legend>
              <div className="adm-grid3">
                <div className="field">
                  <label>Catégorie</label>
                  <select value={p.category} onChange={(e) => set('category', e.target.value as ProductCategory)}>
                    {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="field"><label>Prix (DH) *</label><input type="number" min={0} step={1} value={p.price || ''} onChange={(e) => set('price', Number(e.target.value))} /></div>
                <div className="field"><label>Ancien prix (barré)</label><input type="number" min={0} step={1} value={p.oldPrice ?? ''} onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : null)} placeholder="facultatif" /></div>
              </div>
              <div className="adm-checks">
                <b>Tailles :</b>
                <label><input type="checkbox" checked={oneSize} onChange={(e) => set('sizes', e.target.checked ? ['TU'] : APPAREL)} /> Taille unique</label>
                {!oneSize && APPAREL.map((s) => (
                  <label key={s}>
                    <input type="checkbox" checked={p.sizes.includes(s)} onChange={(e) => set('sizes', APPAREL.filter((x) => (x === s ? e.target.checked : p.sizes.includes(x))))} /> {s}
                  </label>
                ))}
              </div>
              <label className="adm-caught">
                <input type="checkbox" checked={p.soldOut} onChange={(e) => set('soldOut', e.target.checked)} />
                <span><b>Épuisé</b> - le produit reste visible mais ne peut plus être commandé.</span>
              </label>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>Textes</legend>
              <div className="adm-desc-tabs">
                {LANGS.map((l) => (
                  <button type="button" key={l.code} className={lang === l.code ? 'is-on' : ''} onClick={() => setLang(l.code)}>
                    {l.short}{p.name[l.code] ? ' •' : ''}
                  </button>
                ))}
              </div>
              <p className="adm-hint">Si une langue est vide, le texte français est affiché.</p>
              <div className="field"><label>Nom{lang === 'fr' && ' *'}</label><input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={p.name[lang] || ''} onChange={(e) => setL('name', e.target.value)} placeholder="Hoodie technique Noir" /></div>
              <div className="field"><label>Badge (facultatif)</label><input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={p.badge[lang] || ''} onChange={(e) => setL('badge', e.target.value)} placeholder="Nouveau" /></div>
              <div className="field"><label>Description</label><textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={4} value={p.description[lang] || ''} onChange={(e) => setL('description', e.target.value)} /></div>
            </fieldset>

            <fieldset className="adm-fs">
              <legend>Photos ({p.images.length})</legend>
              <div className="adm-checks">
                <b>Affichage :</b>
                <label><input type="radio" name="fit" checked={p.fit === 'cover'} onChange={() => set('fit', 'cover')} /> Photo plein cadre</label>
                <label><input type="radio" name="fit" checked={p.fit === 'contain'} onChange={() => set('fit', 'contain')} /> Produit détouré sur fond studio</label>
              </div>
              <p className="adm-hint">La première photo est celle de la carte ; la 2ᵉ apparaît au survol. Pour « fond studio », utilisez un PNG/WebP transparent.</p>
              <div className="adm-photos">
                {p.images.map((src, i) => (
                  <div key={src} className="adm-photo">
                    <img src={src} alt="" style={{ objectFit: p.fit, background: p.fit === 'contain' ? '#eef2f6' : undefined }} />
                    <div>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === p.images.length - 1}>→</button>
                      <button type="button" onClick={() => set('images', p.images.filter((x) => x !== src))}>🗑</button>
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

export default function ShopTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [view, setView] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  useEffect(() => {
    api.orders().then(setOrders).catch(onAuthError);
    api.products().then(setProducts).catch(onAuthError);
  }, [onAuthError]);

  const updateOrder = async (o: Order, status: OrderStatus) => {
    try { const n = await api.updateOrder(o.id, { status }); setOrders((l) => l!.map((x) => (x.id === n.id ? n : x))); } catch (e) { onAuthError(e); }
  };
  const removeOrder = async (o: Order) => {
    if (!confirm(`Supprimer la commande ${o.ref} de ${o.name} ?`)) return;
    try { await api.deleteOrder(o.id); setOrders((l) => l!.filter((x) => x.id !== o.id)); } catch (e) { onAuthError(e); }
  };
  const removeProduct = async (p: Product) => {
    if (!confirm(`Supprimer « ${p.name.fr} » de la boutique ?`)) return;
    try { await api.deleteProduct(p.id); setProducts((l) => l!.filter((x) => x.id !== p.id)); } catch (e) { onAuthError(e); }
  };
  const moveProduct = async (i: number, d: -1 | 1) => {
    const l = [...(products ?? [])];
    const j = i + d;
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    const next = l.map((p, k) => ({ ...p, order: k }));
    setProducts(next);
    try { await Promise.all([api.updateProduct(next[i].id, { order: i }), api.updateProduct(next[j].id, { order: j })]); } catch (e) { onAuthError(e); }
  };
  const saved = (p: Product) => {
    setProducts((l) => [...(l ?? []).filter((x) => x.id !== p.id), p].sort((a, b) => a.order - b.order));
    setEditing(null);
  };

  const live = (orders ?? []).filter((o) => o.status !== 'cancelled');
  const fresh = live.filter((o) => o.status === 'new').length;

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Boutique</h1>
          <p>Commandes reçues sur la page « Boutique » et produits en vente. Paiement à la livraison : appelez le client pour confirmer.</p>
        </div>
        {view === 'products' && <button className="btn" onClick={() => setEditing('new')}>+ Ajouter un produit</button>}
      </header>

      <div className="adm-stats">
        <div className="adm-stat adm-stat--warn"><small>Nouvelles commandes</small><b>{fresh}</b></div>
        <div className="adm-stat"><small>Commandes (hors annulées)</small><b>{live.length}</b></div>
        <div className="adm-stat adm-stat--gold"><small>Chiffre d'affaires</small><b>{dh(live.reduce((s, o) => s + o.total, 0))}</b></div>
        <div className="adm-stat"><small>Produits en vente</small><b>{(products ?? []).filter((p) => !p.soldOut).length}</b></div>
      </div>

      <div className="adm-filters">
        <div className="adm-seg">
          <button className={view === 'orders' ? 'is-on' : ''} onClick={() => setView('orders')}>Commandes{fresh ? ` (${fresh})` : ''}</button>
          <button className={view === 'products' ? 'is-on' : ''} onClick={() => setView('products')}>Produits</button>
        </div>
      </div>

      {view === 'orders' && (
        <>
          {!orders && <p className="adm-muted">Chargement…</p>}
          {orders?.length === 0 && <div className="adm-empty">Aucune commande pour l'instant. 🛍️</div>}
          <div className="adm-orders">
            {orders?.map((o) => (
              <div key={o.id} className={`adm-order is-${o.status}`}>
                <div className="adm-row__who">
                  <b>{o.name}</b>
                  <span className="adm-ref">{o.ref} · {when(o.createdAt)}</span>
                  <small className="adm-order__addr">{o.city} - {o.address}</small>
                  {o.note && <p className="adm-row__msg">« {o.note} »</p>}
                </div>
                <div className="adm-row__contact">
                  <span className="adm-phone">{o.phone}</span>
                  <div className="adm-row__btns adm-row__btns--h">
                    <a href={wa(o.phone)} target="_blank" rel="noreferrer" className="adm-cbtn adm-cbtn--wa" title={`WhatsApp ${o.phone}`} aria-label="WhatsApp">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
                    </a>
                    <a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="adm-cbtn adm-cbtn--call" title={`Appeler ${o.phone}`} aria-label="Appeler">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" /></svg>
                    </a>
                  </div>
                </div>
                <ul className="adm-order__items">
                  {o.items.map((it, k) => (
                    <li key={k}>
                      {it.image && <img src={it.image} alt="" />}
                      <span>{it.qty} × {it.name}{it.size && it.size !== 'TU' ? ` · ${it.size}` : ''}</span>
                    </li>
                  ))}
                </ul>
                <div className="adm-row__total">{dh(o.total)}</div>
                <select className={`adm-status is-${o.status}`} value={o.status} onChange={(e) => updateOrder(o, e.target.value as OrderStatus)}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className="adm-icon-btn" title="Supprimer" onClick={() => removeOrder(o)}>🗑</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'products' && (
        <div className="adm-fish">
          {!products && <p className="adm-muted">Chargement…</p>}
          {products?.map((p, i) => (
            <div key={p.id} className={`adm-fishrow adm-prod${p.soldOut ? ' is-out' : ''}`}>
              <div className={`adm-prod__img adm-prod__img--${p.fit}`}>{p.images[0] ? <img src={p.images[0]} alt="" /> : '🛍️'}</div>
              <div className="adm-fishrow__name">
                <b>{p.name.fr}</b>
                <small>{CATS[p.category]} · {p.sizes.includes('TU') ? 'Taille unique' : p.sizes.join(' ')}{p.soldOut ? ' · Épuisé' : ''}</small>
              </div>
              <b className="adm-row__total">{dh(p.price)}</b>
              <div className="adm-fishrow__actions">
                <button className="adm-icon-btn" onClick={() => moveProduct(i, -1)} disabled={i === 0} title="Monter">↑</button>
                <button className="adm-icon-btn" onClick={() => moveProduct(i, 1)} disabled={i === products.length - 1} title="Descendre">↓</button>
                <button className="btn ghost sm" onClick={() => setEditing(p)}>Modifier</button>
                <button className="adm-icon-btn" onClick={() => removeProduct(p)} title="Supprimer">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && <ProductForm key="f" item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} onAuthError={onAuthError} />}
      </AnimatePresence>
    </div>
  );
}
