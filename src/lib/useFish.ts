import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Fish, Lang } from './types';

let cache: Fish[] | null = null;

export function useFish() {
  const [fish, setFish] = useState<Fish[] | null>(cache);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      cache = await api.fish();
      setFish(cache);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { fish, error, reload, setFish };
}

export const fishName = (f: Fish, lang: Lang) => f.names[lang] || f.names.fr;
export const fishDescription = (f: Fish, lang: Lang) =>
  f.description[lang] || (lang === 'fr' ? '' : f.description.en) || f.description.fr || '';
