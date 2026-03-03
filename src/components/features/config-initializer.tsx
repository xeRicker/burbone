'use client';

import * as React from 'react';
import { useConfigStore } from '@/stores/use-config-store';

export function ConfigInitializer({ children }: { children: React.ReactNode }) {
  const setConfig = useConfigStore(state => state.setConfig);
  const setLoading = useConfigStore(state => state.setLoading);

  React.useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error("Failed to load config", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [setConfig, setLoading]);

  return <>{children}</>;
}
