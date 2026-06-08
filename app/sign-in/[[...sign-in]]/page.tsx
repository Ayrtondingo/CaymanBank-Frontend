import { SignIn } from "@clerk/nextjs";
<<<<<<< HEAD
import { ShieldCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-sm lg:grid-cols-[0.95fr_1fr]">
        <aside className="hidden bg-[var(--brand-strong)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <ShieldCheck size={26} />
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight">Bienvenido a tu banco digital</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              Accede a tu saldo, transferencias, movimientos y pagos desde una experiencia simple y protegida.
            </p>
          </div>
          <p className="text-xs text-white/60">Cayman Bank protege tu sesion y tus operaciones.</p>
        </aside>

        <div className="flex items-center justify-center p-5 sm:p-8">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#005CBD",
                colorText: "#111827",
                colorBackground: "#FFFFFF",
                colorInputBackground: "#FFFFFF",
                colorInputText: "#111827",
                borderRadius: "16px",
              },
              elements: {
                rootBox: "w-full",
                card: "w-full border-0 shadow-none",
                headerTitle: "text-2xl font-bold tracking-tight",
                headerSubtitle: "text-slate-500",
                formButtonPrimary: "primary-button w-full",
                formFieldInput: "input",
                formFieldLabel: "text-sm font-semibold text-slate-700",
                socialButtonsBlockButton: "rounded-2xl border border-slate-200",
                footerActionLink: "font-semibold text-[#005CBD]",
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
=======

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Efecto de fondo sutil para mantener el estilo hacker */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <SignIn 
        appearance={{ 
          variables: { 
            colorPrimary: '#10b981', // Verde esmeralda neón
            colorText: '#10b981',
            colorBackground: '#000000',
            colorInputBackground: '#000000',
            colorInputText: '#10b981',
            borderRadius: '0px', // Bordes rectos para look hacker
            fontFamily: 'monospace'
          },
          elements: { 
            card: "bg-black border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
            headerTitle: "text-emerald-400 uppercase tracking-widest font-black",
            headerSubtitle: "text-emerald-800 uppercase text-[10px]",
            socialButtonsBlockButton: "border border-emerald-900 hover:bg-emerald-500/10 transition-all",
            socialButtonsBlockButtonText: "text-emerald-500 font-bold",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-none",
            formFieldLabel: "text-emerald-700 uppercase text-[10px] font-bold",
            formFieldInput: "border-emerald-900 focus:border-emerald-500 transition-all rounded-none",
            footerActionLink: "text-emerald-400 hover:text-emerald-200",
            dividerLine: "bg-emerald-900",
            dividerText: "text-emerald-800 uppercase text-[10px]"
          } 
        }} 
      />
    </div>
  );
}
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
