import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-black px-4 font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <p className="mb-4 text-center text-[9px] font-black uppercase tracking-[0.5em] text-[#003300]">
          CAYMAN_BANK // ACCESS_TERMINAL
        </p>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#00ff41',
              colorText: '#00ff41',
              colorBackground: '#000000',
              colorInputBackground: '#000000',
              colorInputText: '#00ff41',
              borderRadius: '0px',
              fontFamily: "'Courier New', monospace",
            },
            elements: {
              card: "bg-black border border-[#003300] shadow-[0_0_30px_rgba(0,255,65,0.08)] rounded-none",
              headerTitle: "text-[#00ff41] uppercase tracking-widest font-black text-sm",
              headerSubtitle: "text-[#004400] uppercase text-[9px] tracking-wider",
              socialButtonsBlockButton: "border border-[#002200] hover:bg-[rgba(0,255,65,0.05)] transition-all rounded-none",
              socialButtonsBlockButtonText: "text-[#005500] font-bold uppercase text-[10px]",
              formButtonPrimary: "bg-[#00ff41] hover:bg-[#00cc33] text-black font-black uppercase tracking-widest rounded-none",
              formFieldLabel: "text-[#004400] uppercase text-[9px] font-bold tracking-widest",
              formFieldInput: "border-[#002200] focus:border-[#00ff41] transition-all rounded-none bg-black text-[#00ff41]",
              footerActionLink: "text-[#00ff41] hover:text-[#00cc33]",
              dividerLine: "bg-[#001a00]",
              dividerText: "text-[#003300] uppercase text-[9px]",
            },
          }}
        />
      </div>
    </div>
  );
}
