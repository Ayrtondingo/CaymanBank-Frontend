import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden font-mono">
      {/* SCANLINE & GRID EFFECT */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#10b981", // Verde neón
            colorText: "#10b981",
            colorBackground: "#000000",
            colorInputBackground: "#000000",
            colorInputText: "#10b981",
            borderRadius: "0px",
            fontFamily: "monospace",
          },
          elements: {
            card: "bg-black border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
            headerTitle: "text-emerald-400 uppercase tracking-[0.2em] font-black",
            headerSubtitle: "text-emerald-800 uppercase text-[10px] tracking-widest",
            socialButtonsBlockButton: "border border-emerald-900 hover:bg-emerald-500/10 transition-all rounded-none",
            socialButtonsBlockButtonText: "text-emerald-500 font-bold uppercase text-[10px]",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-none shadow-[4px_4px_0px_#064e3b]",
            formFieldLabel: "text-emerald-700 uppercase text-[10px] font-bold tracking-tighter",
            formFieldInput: "border-emerald-900 focus:border-emerald-500 transition-all rounded-none",
            footerActionLink: "text-emerald-400 hover:text-emerald-100 underline decoration-emerald-900",
            dividerLine: "bg-emerald-900",
            dividerText: "text-emerald-800 uppercase text-[9px]",
            identityPreviewText: "text-emerald-400",
            identityPreviewEditButtonIcon: "text-emerald-400",
          },
        }}
      />
    </div>
  );
}