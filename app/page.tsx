'use client';

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal, Shield, DollarSign, Globe, Lock,
  TrendingUp, Eye, Zap, ChevronRight
} from "lucide-react";

const services = [
  {
    icon: Globe,
    code: "SRV_001",
    name: "Capital Relocation",
    desc: "Movimiento discreto de fondos entre jurisdicciones. Sin preguntas, sin papeles. Operadores en 47 países.",
    commission: "2.5% por operación",
    tag: "POPULAR",
  },
  {
    icon: TrendingUp,
    code: "SRV_002",
    name: "Asset Optimization",
    desc: "Estructuras fiscales creativas para maximizar el patrimonio. Ingeniería financiera de última generación.",
    commission: "1.8% + setup $5k",
    tag: "PREMIUM",
  },
  {
    icon: Eye,
    code: "SRV_003",
    name: "Offshore Portfolio",
    desc: "Gestión de cartera completamente opaca. Acceso 24/7 a través de canales seguros. Zero trazabilidad.",
    commission: "1.2% anual AUM",
    tag: "DISCRETO",
  },
  {
    icon: Lock,
    code: "SRV_004",
    name: "Shell Corp Bundle",
    desc: "Apertura de empresa fantasma en Cayman, BVI o Seychelles. Documentación lista en 48hs.",
    commission: "$2,500 por entidad",
    tag: "NUEVO",
  },
  {
    icon: Zap,
    code: "SRV_005",
    name: "Express Wash",
    desc: "Blanqueo exprés de capitales a través de nuestra red de contrapartes confiables. Ciclo completo en 72hs.",
    commission: "4% flat",
    tag: "EXPRESS",
  },
  {
    icon: DollarSign,
    code: "SRV_006",
    name: "Anonymous Accounts",
    desc: "Cuentas numeradas. Sin nombre, sin historial, sin problemas. Documentación mínima requerida.",
    commission: "Sin costo de apertura",
    tag: "LIBRE",
  },
];

const stats = [
  { value: "$0", label: "en impuestos pagados" },
  { value: "47", label: "jurisdicciones disponibles" },
  { value: "0", label: "solicitudes de información respondidas" },
  { value: "1977", label: "años de discreción garantizada" },
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-black font-mono text-[#00ff41]">
      {/* Scanline + noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.06)_2px,rgba(0,0,0,0.06)_4px)]" />

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,65,0.04)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-[10px] font-black tracking-[0.5em] text-[#004400]">
            GRAND CAYMAN // CAYMAN ISLANDS // EST. 1977
          </p>

          <h1 className="mb-2 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            <span className="block text-[#00ff41]" style={{ textShadow: "0 0 30px rgba(0,255,65,0.5), 0 0 80px rgba(0,255,65,0.2)" }}>
              CAYMAN
            </span>
            <span className="block text-[#004400]">SHADOW BANK</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#005500]">
            Banca offshore de primera clase. Donde el capital no tiene fronteras,
            los secretos duran para siempre y las preguntas no existen.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up" className="btn-terminal text-sm px-8 py-3">
              <Terminal size={16} />
              ABRIR CUENTA
            </Link>
            <Link href="/sign-in" className="btn-terminal text-sm px-8 py-3" style={{ borderColor: "#003300", color: "#005500" }}>
              <ChevronRight size={16} />
              ACCEDER
            </Link>
          </div>

          <p className="mt-6 text-[9px] text-[#002200] tracking-wider">
            * Los servicios descriptos son ficticios. Proyecto académico.
            Cayman Shadow Bank no se responsabiliza por nada, literalmente nada.
          </p>
        </div>

        {/* Blinking cursor */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-[#003300] animate-pulse">
          <span>SCROLL_DOWN</span>
          <span className="inline-block h-3 w-1.5 bg-[#003300]" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#001a00] bg-black px-6 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-[#00ff41]" style={{ textShadow: "0 0 15px rgba(0,255,65,0.4)" }}>
                {s.value}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#004400]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-[9px] font-black tracking-[0.5em] text-[#004400] mb-3">NUESTROS SERVICIOS</p>
            <h2 className="text-3xl font-black uppercase text-[#00ff41]">
              Soluciones <span className="text-[#004400]">Discretas</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <div
                key={svc.code}
                className="group border border-[#001a00] bg-black p-6 transition-all duration-200 hover:border-[#00ff41] hover:shadow-[0_0_25px_rgba(0,255,65,0.08)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <svc.icon size={20} className="text-[#004400] group-hover:text-[#00ff41] transition-colors" />
                  <span className="text-[8px] font-black tracking-widest text-[#002200] border border-[#001a00] px-2 py-0.5 group-hover:border-[#003300] group-hover:text-[#004400] transition-all">
                    {svc.tag}
                  </span>
                </div>
                <p className="text-[9px] text-[#003300] mb-1 tracking-widest font-bold">{svc.code}</p>
                <h3 className="text-sm font-black uppercase text-[#00ff41] mb-2">{svc.name}</h3>
                <p className="text-[11px] leading-relaxed text-[#005500] mb-4">{svc.desc}</p>
                <div className="border-t border-[#001a00] pt-3 mt-auto">
                  <p className="text-[9px] text-[#004400] uppercase font-bold tracking-wider">Comisión</p>
                  <p className="text-xs font-black text-[#00ff41]">{svc.commission}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="border-t border-[#001a00] px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <Shield size={32} className="mx-auto mb-4 text-[#004400]" />
          <h2 className="text-xl font-black uppercase text-[#00ff41] mb-3">
            La discreción es nuestro producto
          </h2>
          <p className="text-[11px] leading-relaxed text-[#005500] mb-8">
            Operamos bajo el paraguas legal de las Islas Caimán desde 1977.
            Nuestra política de confidencialidad es absoluta. No cooperamos con
            ningún organismo regulatorio, nunca lo hicimos, nunca lo haremos.
          </p>
          <Link href="/sign-up" className="btn-terminal text-sm px-10 py-4">
            <Terminal size={16} />
            INICIAR ONBOARDING
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#001a00] px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[9px] font-black tracking-[0.3em] text-[#003300] uppercase">
            CAYMAN SHADOW BANK © 1977–{new Date().getFullYear()} // ALL RIGHTS IGNORED
          </p>
          <p className="text-[8px] text-[#002200]">
            Grand Cayman, KY1-1102, Cayman Islands // No SWIFT. No AML. No Problem.
          </p>
        </div>
      </footer>
    </div>
  );
}
