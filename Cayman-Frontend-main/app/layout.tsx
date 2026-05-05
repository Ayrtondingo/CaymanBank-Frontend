import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import SyncUser from "./components/SyncUser";
import AuthHeader from "./components/AuthHeader";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cayman Shadow Bank",
  description: "Terminal financiera de acceso restringido",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#2ECC71", colorBackground: "#050505" },
      }}
    >
      <html lang="es" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-black font-sans text-white antialiased`}
        >
          <AuthHeader />
          <SyncUser />

          <main className="relative z-10 flex-1 pt-20">{children}</main>

          <div className="pointer-events-none fixed inset-0 -z-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black" />
        </body>
      </html>
    </ClerkProvider>
  );
}