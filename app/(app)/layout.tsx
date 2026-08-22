"use client";

import { BankProvider, useBank } from "../components/BankProvider";
import { Shell } from "../components/Shell";

function ShellConDatos({ children }: { children: React.ReactNode }) {
  const { perfil } = useBank();
  return <Shell rol={perfil?.role}>{children}</Shell>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BankProvider>
      <ShellConDatos>{children}</ShellConDatos>
    </BankProvider>
  );
}
