import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "../../components/Logo";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-200 bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center text-xl font-semibold text-ink-900">
            Ingresá a tu banco
          </h1>
          <SignIn />
        </div>
      </main>
    </div>
  );
}
