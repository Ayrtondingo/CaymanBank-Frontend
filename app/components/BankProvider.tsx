"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { Api, createApi, Perfil } from "@/lib/api";

interface Toast {
  id: number;
  tono: "exito" | "error" | "info";
  texto: string;
}

interface BankContext {
  api: Api;
  perfil: Perfil | null;
  cargando: boolean;
  error: string | null;
  /** Vuelve a pedir el perfil. Llamalo después de cualquier operación que mueva saldo. */
  refrescar: () => Promise<void>;
  avisar: (tono: Toast["tono"], texto: string) => void;
}

const Contexto = createContext<BankContext | null>(null);

export function useBank() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useBank tiene que usarse dentro de <BankProvider>");
  return contexto;
}

export function BankProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // getToken cambia de identidad en cada render de Clerk; con la ref el api
  // queda estable y no dispara efectos en cascada.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const api = useMemo(() => createApi(() => getTokenRef.current()), []);

  const avisar = useCallback((tono: Toast["tono"], texto: string) => {
    const id = Date.now() + Math.random();
    setToasts((previos) => [...previos, { id, tono, texto }]);
    setTimeout(() => setToasts((previos) => previos.filter((t) => t.id !== id)), 5000);
  }, []);

  const refrescar = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setPerfil(await api.perfil());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [api, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setCargando(false);
      return;
    }
    void refrescar();
  }, [isLoaded, isSignedIn, refrescar]);

  const valor = useMemo(
    () => ({ api, perfil, cargando, error, refrescar, avisar }),
    [api, perfil, cargando, error, refrescar, avisar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}

      {/* Toasts: abajo a la derecha, no bloquean la interfaz. */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={[
              "animate-fade-up pointer-events-auto rounded-lg px-4 py-3 text-sm shadow-[var(--shadow-overlay)]",
              toast.tono === "exito"
                ? "bg-positive-500 text-white"
                : toast.tono === "error"
                  ? "bg-negative-500 text-white"
                  : "bg-brand-900 text-white",
            ].join(" ")}
          >
            {toast.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}
