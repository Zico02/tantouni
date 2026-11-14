import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { scrollLock, useReveal } from '../lib/motion';
import { currentLang } from '../i18n';
import { cart } from '../lib/cart';
import { money, pickText, useProducts } from '../lib/useProducts';
import type { Product, ProductCategory } from '../lib/types';
import './Shop.css';

const CATS: ProductCategory[] = ['hoodie', 'hat', 'cap', 'balaclava'];

function Media({ p, big = false }: { p: Product; big?: boolean }) {
  const lang = currentLang();
  const img = p.images[0];
  return (
    <div className={`pmedia pmedia--${p.fit}${big ? ' pmedia--big' : ''}`}>
      {img && (
        <img
          src={img}
          alt={pickText(p.name, lang)}
          loading={big ? 'eager' : 'lazy'}
          style={p.fit === 'cover' && p.focus ? { objectPosition: p.focus } : undefined}
        />
      )}
      {p.images[1] && !big && <img className="pmedia__alt" src={p.images[1]} alt="" loading="lazy" />}
    </div>
  );
}

function Card({ p, i, onOpen }: { p: Product; i: number; onOpen: () => void }) {
  const { t } = useTranslation();
  const lang = currentLang();
  const [added, setAdded] = useState(false);
  const badge = pickText(p.badge, lang);
  const oneSize = p.sizes.length <= 1;
  const quick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!oneSize) return onOpen();
    cart.add(p.id, p.sizes[0] || '');
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };
  return (
    <article className={`pcard${p.soldOut ? ' is-out' : ''}`} data-reveal data-reveal-delay={(i % 4) * 0.06}>
      <button className="pcard__hit" onClick={onOpen} aria-label={pickText(p.name, lang)} />
      <div className="pcard__media">
        <Media p={p} />
        {badge && !p.soldOut && <span className="pcard__badge">{badge}</span>}
        {p.soldOut && <span className="pcard__badge pcard__badge--out">{t('shop.soldOut')}</span>}
        {!p.soldOut && (
          <button className={`pcard__quick${added ? ' is-added' : ''}`} onClick={quick}>
            {added ? t('shop.added') : oneSize ? `+ ${t('shop.add')}` : `${t('shop.chooseSize')} →`}
          </button>
        )}
      </div>
      <div className="pcard__body">
        <span className="pcard__cat">{t(`shop.${p.category}`)}</span>
        <h3 className="pcard__name">{pickText(p.name, lang)}</h3>
        <p className="pcard__price">
          <b>{money(p.price, lang)}</b>
          {p.oldPrice ? <s>{money(p.oldPrice, lang)}</s> : null}
        </p>
        <p className="pcard__sizes">{oneSize ? t('shop.oneSize') : p.sizes.join(' · ')}</p>
      </div>
    </article>
  );
}

function Quickview({ p, onClose }: { p: Product; onClose: () => void }) {
  const { t } = useTranslation();
  const lang = currentLang();
  const oneSize = p.sizes.length <= 1;
  const [size, setSize] = useState(oneSize ? p.sizes[0] || '' : '');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    scrollLock.lock();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { scrollLock.unlock(); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const add = () => {
    if (!oneSize && !size) { setNudge(true); setTimeout(() => setNudge(false), 600); return; }
    cart.add(p.id, size, qty);
    onClose();
    cart.open();
  };
  const shown = { ...p, images: p.images.length ? [p.images[img], ...p.images.filter((_, k) => k !== img)] : [] };

  return (
    <motion.div className="qv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-lenis-prevent>
      <motion.div
        className="qv__card" role="dialog" aria-modal="true" aria-label={pickText(p.name, lang)}
        initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="qv__x" onClick={onClose} aria-label={t('shop.close')}>✕</button>
        <div className="qv__gallery">
          <Media p={shown} big />
          {p.images.length > 1 && (
            <div className="qv__thumbs">
              {p.images.map((src, k) => (
                <button key={src} className={k === img ? 'is-on' : ''} onClick={() => setImg(k)}><img src={src} alt="" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="qv__info">
          <span className="pcard__cat">{t(`shop.${p.category}`)}</span>
          <h2 className="qv__name display">{pickText(p.name, lang)}</h2>
          <p className="qv__price">
            <b>{money(p.price, lang)}</b>
            {p.oldPrice ? <s>{money(p.oldPrice, lang)}</s> : null}
          </p>
          <p className="qv__desc">{pickText(p.description, lang)}</p>

          <div className={`qv__block${nudge ? ' is-nudge' : ''}`}>
            <span className="qv__label">{t('shop.size')}{!oneSize && !size && <em> · {t('shop.chooseSize')}</em>}</span>
            {oneSize ? (
              <span className="qv__one">{t('shop.oneSize')}</span>
            ) : (
              <div className="qv__sizes">
                {p.sizes.map((s) => (
                  <button key={s} className={s === size ? 'is-on' : ''} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="qv__block">
            <span className="qv__label">{t('shop.qty')}</span>
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="−">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="+">+</button>
            </div>
          </div>

          <button className="btn qv__add" onClick={add} disabled={p.soldOut}>
            {p.soldOut ? t('shop.soldOut') : `${t('shop.add')} · ${money(p.price * qty, lang)}`}
          </button>
          <ul className="qv__perks">
            <li>🚚 {t('shop.perk1')}</li>
            <li>💵 {t('shop.perk2')}</li>
            <li>📞 {t('shop.perk3')}</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Shop() {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const list = useProducts();
  const [cat, setCat] = useState<ProductCategory | 'all'>('all');
  const [open, setOpen] = useState<Product | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useReveal(ref, [i18n.resolvedLanguage, list, cat]);

  useEffect(() => { if (list) cart.prune(list.map((p) => p.id)); }, [list]);
  const cats = useMemo(() => CATS.filter((c) => list?.some((p) => p.category === c)), [list]);
  const shown = (list ?? []).filter((p) => cat === 'all' || p.category === cat);

  return (
    <div className="shop" ref={ref}>
      <div className="shop__bg" aria-hidden><span className="display">TANTOUNI</span></div>

      <section className="container shop__head">
        <div>
          <span className="kicker" data-reveal>{t('shop.kicker')}</span>
          <h1 className="display shop__title" data-reveal>{t('shop.title')}</h1>
          <p className="lead" data-reveal>{t('shop.sub')}</p>
        </div>
        <ul className="shop__perks" data-reveal>
          <li><span aria-hidden>🚚</span>{t('shop.perk1')}</li>
          <li><span aria-hidden>💵</span>{t('shop.perk2')}</li>
          <li><span aria-hidden>📞</span>{t('shop.perk3')}</li>
        </ul>
      </section>

      <section className="container">
        <div className="shop__bar">
          <div className="shop__tabs" role="tablist">
            {(['all', ...cats] as const).map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => setCat(c)}>
                {t(`shop.${c}`)}
                <small>{c === 'all' ? list?.length ?? 0 : list?.filter((p) => p.category === c).length}</small>
              </button>
            ))}
          </div>
          <span className="shop__count">{shown.length} {t('shop.products')}</span>
        </div>

        <div className="shop__grid">
          {list === null && Array.from({ length: 8 }, (_, k) => <div key={k} className="pcard pcard--ghost" />)}
          {shown.map((p, i) => <Card key={p.id} p={p} i={i} onOpen={() => setOpen(p)} />)}
        </div>
      </section>

      <AnimatePresence>{open && <Quickview key={open.id} p={open} onClose={close} />}</AnimatePresence>
      <title>{`${t('nav.shop')} · TANTOUNI`}</title>
    </div>
  );
}
