import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: { default: "Materialplanung", template: "%s · S2 Volt" },
  description: "S2 Volt Materialplanung für Elektroprojekte",
  applicationName: "S2 Volt Materialplanung",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png"
  },
  appleWebApp: { capable: true, title: "S2 Volt", statusBarStyle: "default" },
  formatDetection: { telephone: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff4539" },
    { media: "(prefers-color-scheme: dark)", color: "#16191f" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
