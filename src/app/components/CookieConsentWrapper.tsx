import dynamic from "next/dynamic";

const CookieConsentClient = dynamic(
  () => import("./CookieConsentClient"),
  { ssr: false }
);

export default function CookieConsentWrapper() {
  return <CookieConsentClient />;
}
