import type { Metadata } from "next";
import "./globals.css";
import CookieConsentClient from "./components/CookieConsentClient";
// import ToastListener from "./components/ToastListener";

export const metadata: Metadata = {
  title: "متجر تين كفو",
  description: "متجر تين كفو ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body>
        {children}
        <CookieConsentClient />
        {/* <ToastListener /> */}
      </body>
    </html>
  );
}
