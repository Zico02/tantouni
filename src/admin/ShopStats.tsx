import { useMemo, useState } from 'react';
import type { Order, OrderStatus, Product, ProductCategory } from '../lib/types';
import { dh } from './Admin';

const CATS: Record<ProductCategory, string> = { hoodie: 'Hoodies', balaclava: 'Cagoules', hat: 'Bobs', cap: 'Casquettes' };
const STATUS: Record<OrderStatus, string> = { new: 'Nouvelles', confirmed: 'Confirmées', shipped: 'Expédiées', delivered: 'Livrées', cancelled: 'Annulées' };
const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

interface Row { key: string; label: string; value: number; sub?: string; image?: string }

// Ranked bar list: one hue (magnitude only), labels in text colour, exact value printed, tooltip on hover.
function Bars({ rows, unit, ranked = false }: { rows: Row[]; unit: string; ranked?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="adm-muted">Pas encore de données.</p>;
  return (
    <ul className="adm-bars">
      {rows.map((r, i) => (
        <li key={r.key} className="adm-bar" title={`${r.label} : ${r.value} ${unit}${r.sub ? ` · ${r.sub}` : ''}`}>
          <div className="adm-bar__name">
            {ranked && <b className="adm-bar__rank">{i + 1}</b>}
            {r.image && <img src={r.image} alt="" />}
            <span>{r.label}</span>
          </div>
          <div className="adm-bar__val">{r.value} {unit}{r.sub && <small>{r.sub}</small>}</div>
          <div className="adm-bar__track"><div className="adm-bar__fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function ShopStats({ orders, products }: { orders: Order[] | null; products: Product[] | null }) {
  const [scope, setScope] = useState<'valid' | 'delivered'>('valid');

  const s = useMemo(() => {
    const all = orders ?? [];
    const list = all.filter((o) => (scope === 'delivered' ? o.status === 'delivered' : o.status !== 'cancelled'));
    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    const prod = new Map<string, Row & { revenue: number }>();
    const cats = new Map<string, number>();
    const sizes = new Map<string, number>();
    const cities = new Map<string, number>();
    let items = 0;
    for (const o of list) {
      const city = o.city.trim().replace(/\s+/g, ' ');
      const key = city.toLowerCase();
      cities.set(key, (cities.get(key) ?? 0) + 1);
      for (const it of o.items) {
        items += it.qty;
        const p = byId.get(it.productId);
        const row = prod.get(it.productId) ?? { key: it.productId, label: p?.name.fr || it.name, value: 0, revenue: 0, image: p?.images[0] || it.image };
        row.value += it.qty;
        row.revenue += it.qty * it.price;
        prod.set(it.productId, row);
        if (p) cats.set(p.category, (cats.get(p.category) ?? 0) + it.qty);
        if (it.size && it.size !== 'TU') sizes.set(it.size, (sizes.get(it.size) ?? 0) + it.qty);
      }
    }
    const cityLabel = (k: string) => {
      const o = list.find((x) => x.city.trim().replace(/\s+/g, ' ').toLowerCase() === k);
      return o ? o.city.trim() : k;
    };
    const top = [...prod.values()].sort((a, b) => b.value - a.value || b.revenue - a.revenue);
    const revenue = list.reduce((a, o) => a + o.total, 0);
    return {
      list,
      items,
      revenue,
      basket: list.length ? Math.round(revenue / list.length) : 0,
      customers: new Set(list.map((o) => o.phone.replace(/\D/g, ''))).size,
      top: top.map((r) => ({ ...r, sub: dh(r.revenue) })),
      cats: [...cats.entries()].map(([k, v]) => ({ key: k, label: CATS[k as ProductCategory] ?? k, value: v })).sort((a, b) => b.value - a.value),
      sizes: SIZE_ORDER.filter((x) => sizes.has(x)).map((x) => ({ key: x, label: `Taille ${x}`, value: sizes.get(x)! })),
      cities: [...cities.entries()].map(([k, v]) => ({ key: k, label: cityLabel(k), value: v })).sort((a, b) => b.value - a.value).slice(0, 8),
      status: (Object.keys(STATUS) as OrderStatus[]).map((k) => ({ k, n: all.filter((o) => o.status === k).length })),
      unsold: (products ?? []).filter((p) => !prod.has(p.id)),
    };
  }, [orders, products, scope]);

  if (!orders || !products) return <p className="adm-muted">Chargement…</p>;
  const best = s.top[0];

  return (
    <div className="adm-sstats-wrap">
      <div className="adm-filters">
        <div className="adm-seg">
          <button className={scope === 'valid' ? 'is-on' : ''} onClick={() => setScope('valid')}>Toutes les commandes (hors annulées)</button>
          <button className={scope === 'delivered' ? 'is-on' : ''} onClick={() => setScope('delivered')}>Livrées seulement</button>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat"><small>Articles vendus</small><b>{s.items}</b></div>
        <div className="adm-stat"><small>Commandes</small><b>{s.list.length}</b></div>
        <div className="adm-stat adm-stat--gold"><small>Panier moyen</small><b>{dh(s.basket)}</b></div>
        <div className="adm-stat"><small>Clients différents</small><b>{s.customers}</b></div>
      </div>

      <div className="adm-sstats">
        <div className="adm-sstats__col">
          {best && (
            <section className="adm-card adm-best">
              <img src={best.image} alt="" />
              <div>
                <small>🏆 Meilleure vente</small>
                <b>{best.label}</b>
                <span><strong>{best.value}</strong> vendu(s) · {dh(best.revenue)} · {Math.round((best.value / Math.max(1, s.items)) * 100)} % des articles</span>
              </div>
            </section>
          )}
          <section className="adm-card">
            <h3>Classement des produits</h3>
            <p className="adm-hint">Quantités vendues, avec le montant total par produit.</p>
            <Bars rows={s.top} unit="vendu(s)" ranked />
            {s.unsold.length > 0 && s.list.length > 0 && (
              <p className="adm-hint" style={{ marginTop: 14 }}>Pas encore vendus : {s.unsold.map((p) => p.name.fr).join(', ')}.</p>
            )}
          </section>
        </div>
        <div className="adm-sstats__col">
          <section className="adm-card">
            <h3>Par catégorie</h3>
            <p className="adm-hint">Nombre d'articles vendus.</p>
            <Bars rows={s.cats} unit="art." />
          </section>
          <section className="adm-card">
            <h3>Tailles demandées</h3>
            <p className="adm-hint">Hoodies uniquement : utile pour savoir quoi recommander en stock.</p>
            <Bars rows={s.sizes} unit="art." />
          </section>
          <section className="adm-card">
            <h3>Villes</h3>
            <p className="adm-hint">Nombre de commandes par ville de livraison.</p>
            <Bars rows={s.cities} unit="cmd" />
          </section>
          <section className="adm-card">
            <h3>Statut des commandes</h3>
            <p className="adm-hint">Toutes les commandes, y compris annulées.</p>
            <div className="adm-status-list">
              {s.status.map(({ k, n }) => <span key={k} className={`adm-status is-${k}`}>{STATUS[k]}<b>{n}</b></span>)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
