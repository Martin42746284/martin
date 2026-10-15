import { useEffect, useRef, type MutableRefObject } from 'react';

interface TurnstileApi {
  render: (container: HTMLElement, params: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = 'turnstile-api';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface Props {
  siteKey: string;
  onToken: (token: string | null) => void;
  /** Le parent reçoit ici une fonction pour réinitialiser le widget après l'envoi. */
  resetRef: MutableRefObject<(() => void) | null>;
}

/** Case « Je suis humain » de Cloudflare Turnstile, chargée à la demande. */
export function Turnstile({ siteKey, onToken, resetRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId !== null) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    resetRef.current = () => {
      if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
      onToken(null);
    };

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      resetRef.current = null;
    };
  }, [siteKey, onToken, resetRef]);

  return <div ref={containerRef} />;
}
