// app/api/fb-capi/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

const PIXEL_ID = process.env.FB_PIXEL_ID!;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN!;
// const  testEventCode = process.env.FB_TEST_EVENT_CODE!;
function sha256Hex(v = "") {
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}
function toE164(phone = "") {
  const d = phone.replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.startsWith("0")) return `971${d.slice(1)}`;
  return d;
}

export async function POST(req: Request) {
  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json({ ok: false, error: "env missing" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const rawUser = body.user_data || {};

    // Normalize + hash
    const phoneE164 = toE164(rawUser.phone || "");
    const hashedPhone = phoneE164 ? sha256Hex(phoneE164) : undefined;
    const hashedEmail = rawUser.email ? sha256Hex(rawUser.email) : undefined;
    const hashedFn = rawUser.first_name ? sha256Hex(rawUser.first_name) : undefined;
    const hashedLn = rawUser.last_name ? sha256Hex(rawUser.last_name) : undefined;

    const user_data: Record<string, any> = {};
    if (hashedEmail) user_data.em = hashedEmail;
    if (hashedPhone) user_data.ph = hashedPhone;
    if (hashedFn) user_data.fn = hashedFn;
    if (hashedLn) user_data.ln = hashedLn;

    // optionally include client info if provided by client
    if (rawUser.client_ip_address) user_data.client_ip_address = rawUser.client_ip_address;
    if (rawUser.client_user_agent) user_data.client_user_agent = rawUser.client_user_agent;
    if (rawUser.fbp) user_data.fbp = rawUser.fbp;
    if (rawUser.fbc) user_data.fbc = rawUser.fbc;

    const event = {
      event_name: body.event_name || "Purchase",
      event_time: body.event_time || Math.floor(Date.now() / 1000),
      action_source: body.action_source || "website",
      event_id: body.event_id, // إن وُجد
      event_source_url: body.event_source_url,
      user_data,
      custom_data: {
        value: Number(body.custom_data?.value || 0),
        currency: body.custom_data?.currency || "AED",
        contents: body.custom_data?.contents || [],
      },
    };

    const fbRes = await fetch(
      `https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),//,test_event_code: testEventCode
      }
    );

    const json = await fbRes.json().catch(() => ({}));
    return NextResponse.json({ ok: fbRes.ok, status: fbRes.status, body: json }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
