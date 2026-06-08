'use client';

import Link from "next/link";
import { Landmark, LogIn } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid size-10 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Landmark size={22} />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-[var(--foreground)]">Cayman Bank</span>
            <span className="block text-xs leading-tight text-[var(--muted)]">Banca digital</span>
          </span>
        </Link>

        <SignedIn>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold text-[var(--foreground)]">Sesion segura</p>
              <p className="text-[var(--muted)]">Conexion protegida</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "rounded-2xl border border-[var(--border)] w-10 h-10",
                  userButtonPopoverCard: "rounded-3xl border border-slate-200 shadow-xl",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </div>
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in" className="primary-button">
            <LogIn size={18} />
            Ingresar
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
