import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadAll, saveMode, saveName, type BoothMode, type Stored } from '@/lib/storage';

type AppState = Stored & {
  ready: boolean;
  setName: (name: string) => void;
  setMode: (mode: BoothMode) => void;
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

  const setName = useCallback((raw: string) => {
    const name = displayName(raw);
    setData((d) => ({ ...d, name, firstLaunch: false }));
    saveName(name);
  }, []);

  const setMode = useCallback((mode: BoothMode) => {
    setData((d) => ({ ...d, mode }));
    saveMode(mode);
  }, []);

  const value = useMemo(() => ({ ...data, ready, setName, setMode }), [data, ready, setName, setMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
