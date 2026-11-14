import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../lib/api';
import { cart, useCart } from '../lib/cart';
import { scrollLock } from '../lib/motion';
import { currentLang } from '../i18n';
import { loadProducts, money, pickText } from '../lib/useProducts';
import type { Product } from '../lib/types';
import { PerkIcon } from './PerkIcon';
import './CartDrawer.css';

type Step = 'cart' | 'form' | 'done';

export function CartButton() {
  const { t } = useTranslation();
  const { lines } = useCart();
  const n = lines.reduce((s, l) => s + l.qty, 0);
  return (
    <button className="cart-btn" onClick={() => cart.open()} aria-label={`${t('shop.cart')} (${n})`}>
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" />
      </svg>
      <AnimatePresence>
        {n > 0 && (
          <motion.span key={n} className="cart-btn__n" initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{n}</motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function CartDrawer() {
  const { t } = useTranslation();
  const lang = currentLang();
  const { lines, open } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ ref: string; total: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    loadProducts().then(setProducts).catch(() => {});
    scrollLock.lock();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cart.close();
    window.addEventListener('keydown', onKey);
    return () => { scrollLock.unlock(); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const rows = lines
    .map((l, i) => ({ l, i, p: products.find((p) => p.id === l.id) }))
    .filter((r): r is { l: typeof r.l; i: number; p: Product } => Boolean(r.p));
  // a product can sell out while it sits in a cart: show it, but leave it out of the order
  const buyable = rows.filter((r) => !r.p.soldOut);
  const total = buyable.reduce((s, r) => s + r.p.price * r.l.qty, 0);
  const count = buyable.reduce((s, r) => s + r.l.qty, 0);

  const close = () => {
    cart.close();
    if (step === 'done') { setStep('cart'); setDone(null); }
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await api.order({ ...form, lang, items: buyable.map(({ l }) => ({ id: l.id, size: l.size, qty: l.qty })) });
      setDone(r);
      setStep('done');
      cart.clear();
    } catch {
      setErr(t('shop.error'));
    } finally {
      setBusy(false);
    }
  };
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} data-lenis-prevent>
          <motion.aside
            className="drawer__panel" role="dialog" aria-modal="true" aria-label={t('shop.cart')}
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="drawer__head">
              <h2 className="display">{step === 'form' ? t('shop.fTitle') : t('shop.cart')}{step === 'cart' && count > 0 && <small>{count}</small>}</h2>
              <button className="drawer__x" onClick={close} aria-label={t('shop.close')}>✕</button>
            </header>

            {step === 'cart' && (
              <>
                <div className="drawer__body">
                  {rows.length === 0 ? (
                    <div className="drawer__empty">
                      <span className="drawer__empty-ic"><PerkIcon i={3} size={30} /></span>
                      <p>{t('shop.empty')}</p>
                      <button className="btn ghost sm" onClick={close}>{t('shop.keepShopping')}</button>
                    </div>
                  ) : (
                    <ul className="cline-list">
                      {rows.map(({ l, i, p }) => (
                        <li key={`${l.id}-${l.size}`} className={`cline${p.soldOut ? ' is-out' : ''}`}>
                          <div className={`cline__img cline__img--${p.fit}`}>{p.images[0] && <img src={p.images[0]} alt="" style={p.fit === 'cover' && p.focus ? { objectPosition: p.focus } : undefined} />}</div>
                          <div className="cline__info">
                            <b>{pickText(p.name, lang)}</b>
                            {p.soldOut && <em className="cline__out">{t('shop.soldOut')}</em>}
                            <span>{t('shop.size')} : {l.size === 'TU' || !l.size ? t('shop.oneSize') : l.size}</span>
                            <div className="cline__row">
                              <div className="qty qty--sm">
                                <button onClick={() => cart.setQty(i, l.qty - 1)} aria-label="−">−</button>
                                <span>{l.qty}</span>
                                <button onClick={() => cart.setQty(i, l.qty + 1)} aria-label="+">+</button>
                              </div>
                              <b className="cline__price">{money(p.price * l.qty, lang)}</b>
                            </div>
                            <button className="cline__rm" onClick={() => cart.remove(i)}>{t('shop.remove')}</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {rows.length > 0 && (
                  <footer className="drawer__foot">
                    <div className="drawer__total"><span>{t('shop.subtotal')}</span><b>{money(total, lang)}</b></div>
                    <p className="drawer__cod"><PerkIcon i={1} size={18} />{t('shop.cod')}</p>
                    <button className="btn drawer__cta" onClick={() => setStep('form')} disabled={buyable.length === 0}>{t('shop.checkout')} →</button>
                  </footer>
                )}
              </>
            )}

            {step === 'form' && (
              <form className="drawer__form" onSubmit={submit}>
                <div className="drawer__body">
                  <button type="button" className="drawer__back" onClick={() => setStep('cart')}>{t('shop.back')}</button>
                  <div className="field"><label htmlFor="o-name">{t('shop.fName')}</label><input id="o-name" required autoComplete="name" value={form.name} onChange={set('name')} /></div>
                  <div className="field"><label htmlFor="o-phone">{t('shop.fPhone')}</label><input id="o-phone" required type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} /></div>
                  <div className="field"><label htmlFor="o-city">{t('shop.fCity')}</label><input id="o-city" required autoComplete="address-level2" value={form.city} onChange={set('city')} /></div>
                  <div className="field"><label htmlFor="o-address">{t('shop.fAddress')}</label><textarea id="o-address" required rows={2} autoComplete="street-address" value={form.address} onChange={set('address')} /></div>
                  <div className="field"><label htmlFor="o-note">{t('shop.fNote')}</label><textarea id="o-note" rows={2} value={form.note} onChange={set('note')} /></div>
                  {err && <p className="drawer__err">{err}</p>}
                </div>
                <footer className="drawer__foot">
                  <div className="drawer__total"><span>{t('shop.subtotal')}</span><b>{money(total, lang)}</b></div>
                  <p className="drawer__cod"><PerkIcon i={1} size={18} />{t('shop.cod')}</p>
                  <button className="btn drawer__cta" disabled={busy || buyable.length === 0}>{busy ? t('shop.sending') : t('shop.submit')}</button>
                </footer>
              </form>
            )}

            {step === 'done' && done && (
              <div className="drawer__body drawer__done">
                <motion.span className="drawer__check" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>✓</motion.span>
                <h3 className="display">{t('shop.doneTitle')}</h3>
                <p>{t('shop.doneRef')}</p>
                <b className="drawer__ref">{done.ref}</b>
                <p className="drawer__muted">{money(done.total, lang)} · {t('shop.perk2')}</p>
                <p>{t('shop.doneNext')}</p>
                <button className="btn" onClick={close}>{t('shop.close')}</button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
