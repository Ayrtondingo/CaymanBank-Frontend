'use client';

import Link from "next/link";
import { Terminal } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-800/50 bg-black/50 px-6 backdrop-blur-md max-w-7xl mx-auto w-full">
      <span className="font-mono text-sm tracking-wider text-emerald-400">CAYMAN // SECURE</span>

      <SignedIn>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-[10px] font-mono leading-none text-emerald-500">
            <p className="font-bold tracking-widest text-[9px]">
              OPERATOR_ONLINE
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
              <p className="text-[8px] uppercase text-emerald-900">Secure_Link: Established</p>
            </div>
          </div>
          
          <div className="border-l border-emerald-900 pl-4 py-1">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "rounded-none border border-emerald-500 w-8 h-8",
                  userButtonPopoverCard: "bg-black border border-emerald-900 rounded-none font-mono",
                  userButtonPopoverActionButtonText: "text-emerald-500 uppercase text-[10px]",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <Link
          href="/sign-in"
          className="group relative flex items-center gap-2 border border-emerald-500 bg-transparent px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 transition-all hover:bg-emerald-500 hover:text-black"
        >
          <Terminal size={14} className="group-hover:animate-pulse" />
          <span>Access_System</span>
          
          <div className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-emerald-500" />
          <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-emerald-500" />
        </Link>
      </SignedOut>
    </header>
  );
}



