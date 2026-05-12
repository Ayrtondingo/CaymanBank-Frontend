import { SignIn } from "@clerk/nextjs";

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