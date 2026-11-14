import { useEffect, useState } from 'react';
import { api } from './api';
import type { Lang, Product } from './types';

// One fetch shared by the shop page and the cart drawer.
let cache: Promise<Product[]> | null = null;
export const loadProducts = (fresh = false) => {
  if (!cache || fresh) cache = api.products().catch((e) => { cache = null; throw e; });
  return cache;
};

export function useProducts() {
  const [list, setList] = useState<Product[] | null>(null);
  useEffect(() => {
    let live = true;
    loadProducts(true).then((l) => live && setList(l)).catch(() => live && setList([]));
    return () => { live = false; };
  }, []);
  return list;
}

export const pickText = (o: Partial<Record<Lang, string>> | undefined, lang: Lang) => o?.[lang] || o?.fr || o?.en || '';
export const money = (n: number, lang: Lang) =>
  `${n.toLocaleString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : lang)} DH`;
