import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import SyncUser from "./components/SyncUser";
import AuthHeader from "./components/AuthHeader";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cayman Bank",
  description: "Homebanking simple, moderno y seguro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#005CBD",
          colorBackground: "#FFFFFF",
          colorText: "#111827",
          borderRadius: "16px",
        },
      }}
    >
      <html lang="es" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col font-sans antialiased`}
        >
          <AuthHeader />
          <SyncUser />

          <main className="relative z-10 flex-1 pt-20">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
