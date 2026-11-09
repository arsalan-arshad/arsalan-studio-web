"use client";

import { useEffect, useRef } from "react";

type Handler = (data: unknown) => void;

/**
 * Subscribe to a same-origin SSE endpoint. Auto-reconnects via EventSource.
 * Pass `url: null` to disconnect.
 */
export function useEventSource(
  url: string | null,
  eventName: string,
  onEvent: Handler,
) {
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url);
    const listener = (ev: MessageEvent) => {
      try {
        handlerRef.current(JSON.parse(String(ev.data)) as unknown);
      } catch {
        /* ignore malformed payloads */
      }
    };
    es.addEventListener(eventName, listener);

    return () => {
      es.removeEventListener(eventName, listener);
      es.close();
    };
  }, [url, eventName]);
}
