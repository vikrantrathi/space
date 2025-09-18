'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { theme as antdTheme } from 'antd';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolved: ResolvedTheme;
  algorithm: typeof antdTheme.defaultAlgorithm | typeof antdTheme.darkAlgorithm;
}

const STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used within ThemeProvider');
  }
  return ctx;
};

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function computeResolved(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemPrefersDark() ? 'dark' : 'light';
  }
  return mode;
}

function applyHtmlTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  // Tailwind dark mode compatibility (class strategy)
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('light'); // Start with light for SSR
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Handle client mounting and apply theme immediately
  useEffect(() => {
    setIsClientMounted(true);
    
    // Apply theme immediately to prevent flash
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const initialMode: ThemeMode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      setModeState(initialMode);
      const res = computeResolved(initialMode);
      setResolved(res);
      applyHtmlTheme(res);
    } catch {
      // Fallback to light theme
      applyHtmlTheme('light');
    }
  }, []);

  // Initialize from localStorage after client mount (redundant but safe)
  useEffect(() => {
    if (!isClientMounted) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const initialMode: ThemeMode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      setModeState(initialMode);
      const res = computeResolved(initialMode);
      setResolved(res);
      applyHtmlTheme(res);
    } catch {
      // noop
    }
  }, [isClientMounted]);

  // React to system changes when mode is system
  useEffect(() => {
    if (!isClientMounted || mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (e: MediaQueryListEvent) => {
      const res = e.matches ? 'dark' : 'light';
      setResolved(res);
      applyHtmlTheme(res);
    };

    if ('addEventListener' in mq) {
      mq.addEventListener('change', onChange as unknown as EventListener);
    } else if ('addListener' in mq) {
      (mq as MediaQueryList & {
        addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
      }).addListener(onChange);
    }

    return () => {
      if ('removeEventListener' in mq) {
        mq.removeEventListener('change', onChange as unknown as EventListener);
      } else if ('removeListener' in mq) {
        (mq as MediaQueryList & {
          removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
        }).removeListener(onChange);
      }
    };
  }, [mode, isClientMounted]);

  // When mode changes explicitly (not by system)
  useEffect(() => {
    if (!isClientMounted) return;
    
    const res = computeResolved(mode);
    setResolved(res);
    applyHtmlTheme(res);
  }, [mode, isClientMounted]);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      if (isClientMounted) {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // ignore storage errors
    }
    setModeState(next);
  }, [isClientMounted]);

  const algorithm = useMemo(() => {
    return resolved === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  }, [resolved]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      resolved,
      algorithm,
    }),
    [mode, setMode, resolved, algorithm],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}