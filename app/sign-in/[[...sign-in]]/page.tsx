import { SignIn } from "@clerk/nextjs";
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
