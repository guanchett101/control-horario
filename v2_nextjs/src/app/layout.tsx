import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control Horario",
  description: "Sistema de gestión de empleados y fichajes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Eruda - Consola móvil para debugging */}
        {process.env.NODE_ENV !== 'production' && (
          <>
            <Script
              src="https://cdn.jsdelivr.net/npm/eruda"
              strategy="afterInteractive"
            />
            <Script
              id="eruda-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  try {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                      if (window.eruda) window.eruda.init();
                    }
                  } catch (e) {}
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
