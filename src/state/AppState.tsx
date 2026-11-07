import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  loadAll,
  saveGallery,
  saveMode,
  saveName,
  type BoothMode,
  type GalleryItem,
  type Stored,
} from '@/lib/storage';

type AppState = Stored & {
  ready: boolean;
  setName: (name: string) => void;
  setMode: (mode: BoothMode) => void;
  /** newest first */
  addItem: (item: GalleryItem) => void;
};

const Ctx = createContext<AppState | null>(null);

/** the name is always shown trimmed + lowercase */
export const displayName = (s: string) => s.trim().toLowerCase();

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Stored>({ name: '', firstLaunch: true, mode: 'single', gallery: [] });

  useEffect(() => {
    loadAll()
      .then(setData)
      .catch(() => {}) // fall back to first-launch defaults
      .finally(() => setReady(true));
  }, []);

  // keep the gallery index on disk in step with memory (skipped until the stored one is loaded)
  useEffect(() => {
    if (ready) saveGallery(data.gallery);
  }, [ready, data.gallery]);

  const setName = useCallback((raw: string) => {
    const name = displayName(raw);
    setData((d) => ({ ...d, name, firstLaunch: false }));
    saveName(name);
  }, []);

  const setMode = useCallback((mode: BoothMode) => {
    setData((d) => ({ ...d, mode }));
    saveMode(mode);
  }, []);

  const addItem = useCallback((item: GalleryItem) => {
    setData((d) => ({ ...d, gallery: [item, ...d.gallery] }));
  }, []);

  const value = useMemo(
    () => ({ ...data, ready, setName, setMode, addItem }),
    [data, ready, setName, setMode, addItem],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
