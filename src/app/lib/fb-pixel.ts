// src/app/lib/fb-pixel.ts

declare global {
  interface Window {
    fbq?: ((action: string, ...args: unknown[]) => void) & {
      loaded?: boolean;
      version?: string;
      queue?: unknown[][];
      callMethod?: (...args: unknown[]) => void;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

/**
 * Load the Facebook Pixel script and initialize a lightweight fbq stub
 */
export function loadFacebookPixel(pixelId?: string): void {
  if (typeof window === "undefined") return;
  if (!pixelId) return;

  if (window.fbq && window.fbq.loaded) return;

  (function (f: Window, b: Document, e: string, v: string) {
    // if fbq already exists, do nothing
    if (f.fbq) return;

    // create a stub function that either delegates to callMethod or queues the args
    const n = function (...args: unknown[]) {
      const call = (n as unknown as { callMethod?: (...a: unknown[]) => void }).callMethod;
      if (typeof call === "function") {
        call(...args);
      } else {
        const q = (n as unknown as { queue?: unknown[][] }).queue;
        if (Array.isArray(q)) {
          q.push(args);
        }
      }
    } as unknown as Window["fbq"];

    // attach metadata and helpers
    (n as unknown as Record<string, unknown>).push = n;
    (n as unknown as Record<string, unknown>).loaded = true;
    (n as unknown as Record<string, unknown>).version = "2.0";
    (n as unknown as Record<string, unknown>).queue = [];

    // insert the external script (ensure we treat t as HTMLScriptElement)
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;

    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);

    // expose on window
    f.fbq = n;
    if (!f._fbq) f._fbq = n;
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  try {
    window.fbq?.("init", pixelId);
    window.fbq?.("consent", "grant");
    window.fbq?.("track", "PageView");
  } catch (err) {
    console.error("Facebook Pixel init error:", err);
  }
}

/** Track a custom event */
export function fbqTrack(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("track", eventName, params ?? {});
  } catch (err) {
    console.error("Facebook Pixel track error:", err);
  }
}

/** Grant consent to the pixel */
export function fbqConsentGrant(): void {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("consent", "grant");
  } catch (err) {
    console.error("Facebook Pixel consent error:", err);
  }
}

/** Revoke consent from the pixel */
export function fbqConsentRevoke(): void {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("consent", "revoke");
  } catch (err) {
    console.error("Facebook Pixel consent error:", err);
  }
}

const fbPixelHelpers = {
  loadFacebookPixel,
  fbqTrack,
  fbqConsentGrant,
  fbqConsentRevoke,
};

export default fbPixelHelpers;
