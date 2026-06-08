import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import SyncUser from "./components/SyncUser";
import AuthHeader from "./components/AuthHeader";
import "./globals.css";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cayman Shadow Bank",
  description: "Terminal financiera de acceso restringido // Offshore Banking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00ff41",
          colorBackground: "#000000",
          colorText: "#00ff41",
          colorTextSecondary: "#004400",
          colorInputBackground: "#000000",
          colorInputText: "#00ff41",
          borderRadius: "0px",
          fontFamily: "'Courier New', Courier, monospace",
        },
        elements: {
          card: "bg-black border border-[#001a00] shadow-none rounded-none font-mono",
          headerTitle: "text-[#00ff41] uppercase tracking-widest text-sm font-black",
          headerSubtitle: "text-[#004400] uppercase text-[10px] tracking-wider",
          formButtonPrimary: "bg-[#00ff41] text-black font-black uppercase tracking-widest rounded-none hover:bg-[#00cc33]",
          formFieldInput: "bg-black border-[#003300] text-[#00ff41] rounded-none font-mono",
          footerActionLink: "text-[#00ff41] uppercase text-[10px]",
          identityPreviewText: "text-[#00ff41]",
          dividerLine: "bg-[#001a00]",
          dividerText: "text-[#003300]",
        },
      }}
    >
      <html lang="es" className="h-full" suppressHydrationWarning>
        <body className={`${geistMono.variable} flex min-h-screen flex-col bg-black antialiased`}>
          <AuthHeader />
          <SyncUser />
          <main className="relative z-10 flex-1 pt-14">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
