// src/lib/tracking.ts
import { loadFacebookPixel, fbqTrack } from "./fb-pixel";

const PIXEL_ID = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FB_PIXEL_ID : undefined;
const API_PATH = "/api/fb-capi";

export function initTracking() {
  try {
    if (typeof window !== "undefined" && PIXEL_ID) {
      loadFacebookPixel(PIXEL_ID);
    }
  } catch (e) {
    console.warn("initTracking error", e);
  }
}

/**
 * جمع بيانات المستخدم من المتصفح تلقائيًا
 */
function collectClientUserData(): Record<string, any> {
  if (typeof window === "undefined") return {};

  const userData: Record<string, any> = {};

  // جمع client_user_agent
  if (window.navigator && window.navigator.userAgent) {
    userData.client_user_agent = window.navigator.userAgent;
  }

  // جمع fbp و fbc من cookies
  const cookies = document.cookie.split(';');
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      userData.fbp = value;
    }
    if (name === '_fbc') {
      userData.fbc = value;
    }
  });

  return userData;
}

/**
 * Sends event to client pixel (fbq) then server CAPI
 */
export async function trackEventClientAndServer(eventName: string, payload: Record<string, any> = {}) {
  // 1) client pixel
  try {
    if (typeof window !== "undefined" && window.fbq) {
      try {
        fbqTrack(eventName, payload.custom_data || {});
      } catch (err) {
        console.warn("fbqTrack failed", err);
      }
    }
  } catch (e) {
    console.warn("fbq not available", e);
  }

  // 2) server CAPI
  try {
    // جمع بيانات المستخدم تلقائيًا إذا لم تكن موجودة
    let userData = payload.user_data || {};
    
    // فقط أضف البيانات التلقائية إذا كانت user_data فارغة
    if (Object.keys(userData).length === 0) {
      userData = collectClientUserData();
    }

    const body = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
      action_source: payload.action_source || "website",
      user_data: userData, // استخدم البيانات المجمعة
      custom_data: payload.custom_data || {},
    };

    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    console.warn("trackEventClientAndServer error", err);
    return { ok: false, status: 0, body: null };
  }
}

export async function trackAddToCart(item: any) {
  // جمع بيانات المستخدم تلقائيًا
  const clientUserData = collectClientUserData();
  
  const payload = {
    user_data: clientUserData, // أضف البيانات المجمعة
    custom_data: {
      value: Number(item.price || 0),
      currency: "AED",
      contents: [{
        id: String(item.id),
        quantity: item.qty || 1,
        item_price: Number(String(item.price).replace(/[^0-9.]/g, ""))
      }],
    },
  };
  
  return trackEventClientAndServer("AddToCart", payload);
}

export async function trackPurchase(order: any) {
  const payload = {
    user_data: order.user_data || {},
    custom_data: {
      value: Number(order.custom_data?.value || order.total || 0),
      currency: order.custom_data?.currency || "AED",
      contents: order.custom_data?.contents || (order.items || []).map((i: any) => ({
        id: String(i.id),
        quantity: i.qty,
        item_price: Number(String(i.price).replace(/[^0-9.]/g, ""))
      })),
    },
  };
  return trackEventClientAndServer("Purchase", payload);
}

export default { initTracking, trackAddToCart, trackPurchase };