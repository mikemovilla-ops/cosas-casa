"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sondeo simple para mantener la lista al día con lo que añada/mueva la otra
// persona desde su móvil, sin montar websockets para una app de dos usuarios.
export function usePoll<T>(fetcher: () => Promise<T[]>, intervalMs = 4000) {
  const [items, setItems] = useState<T[]>([]);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    try {
      const data = await fetcherRef.current();
      setItems(data);
    } catch {
      // Un fallo puntual de red no debe tirar la lista ya cargada.
    }
  }, []);

  useEffect(() => {
    reload();
    const id = setInterval(reload, intervalMs);
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload, intervalMs]);

  return { items, setItems, reload };
}
