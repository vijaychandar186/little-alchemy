'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react';
import { DEFAULT_SCHEME } from './scheme.config';

const COOKIE_NAME = 'active_scheme';

function setSchemeCookie(scheme: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${scheme}; path=/; max-age=31536000; SameSite=Lax;${window.location.protocol === 'https:' ? ' Secure;' : ''}`;
}

type SchemeContextType = {
  activeScheme: string;
  setActiveScheme: (scheme: string) => void;
};

const SchemeContext = createContext<SchemeContextType | undefined>(undefined);

export function SchemeProvider({
  children,
  initialScheme
}: {
  children: ReactNode;
  initialScheme?: string;
}) {
  const [activeScheme, setActiveScheme] = useState(
    initialScheme ?? DEFAULT_SCHEME
  );

  useEffect(() => {
    setSchemeCookie(activeScheme);
    document.documentElement.setAttribute('data-theme', activeScheme);
  }, [activeScheme]);

  return (
    <SchemeContext.Provider value={{ activeScheme, setActiveScheme }}>
      {children}
    </SchemeContext.Provider>
  );
}

export function useScheme() {
  const ctx = useContext(SchemeContext);
  if (!ctx) throw new Error('useScheme must be used within SchemeProvider');
  return ctx;
}
