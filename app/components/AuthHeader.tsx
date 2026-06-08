'use client';

import Link from "next/link";
import { Terminal } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#001a00] bg-black/90 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-3 group" aria-label="Inicio">
        <Terminal size={16} className="text-[#00ff41] group-hover:animate-pulse" />
        <span className="text-xs font-black tracking-[0.3em] text-[#00ff41] uppercase">
          CAYMAN<span className="text-[#004400]">::</span>BANK
        </span>
      </Link>

      <SignedIn>
        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end text-[9px] font-black uppercase leading-tight tracking-widest text-[#005500] sm:flex">
            <span className="text-[#00ff41]">SESSION_ACTIVE</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff41] shadow-[0_0_6px_#00ff41]" />
              SECURE_LINK: OK
            </span>
          </div>
          <div className="border-l border-[#001a00] pl-4">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "rounded-none border border-[#00ff41] w-8 h-8",
                  userButtonPopoverCard: "bg-black border border-[#003300] rounded-none font-mono shadow-[0_0_30px_rgba(0,255,65,0.1)]",
                  userButtonPopoverActionButtonText: "text-[#00ff41] uppercase text-[10px] font-mono",
                  userButtonPopoverFooter: "hidden",
                  userButtonPopoverActionButtonIcon: "text-[#00ff41]",
                },
              }}
            />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <Link
          href="/sign-in"
          className="btn-terminal text-[10px]"
        >
          <Terminal size={12} />
          ACCESS_SYSTEM
        </Link>
      </SignedOut>
    </header>
  );
}
