import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import SyncUser from "./components/SyncUser";
import { ScriptTema } from "./components/TemaToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cayman Bank — Home Banking",
  description: "Banca en línea de Cayman Bank: cuentas, transferencias, tarjetas, préstamos e inversiones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={{
        variables: {
          colorPrimary: "#0a2540",
          colorText: "#232932",
          colorTextSecondary: "#6b7484",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
        elements: {
          card: "shadow-[0_4px_12px_rgba(10,37,64,0.08)] border border-ink-200",
          headerTitle: "text-ink-900 font-semibold",
          headerSubtitle: "text-ink-500",
          formButtonPrimary:
            "bg-brand-900 hover:bg-brand-800 text-white font-semibold normal-case text-sm",
          footerActionLink: "text-accent-600 hover:text-accent-700 font-medium",
        },
      }}
    >
      <html lang="es" className="h-full" suppressHydrationWarning>
        <head>
          <ScriptTema />
        </head>
        <body className={`${inter.variable} min-h-screen antialiased`}>
          <SyncUser />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
