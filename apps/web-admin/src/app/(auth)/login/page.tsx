"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loginAction, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = {};

const INPUT =
  "w-full rounded-lg border border-neutral-300 bg-pethood-input px-3.5 py-2.5 text-base text-neutral-900 outline-none transition-colors focus:border-pethood-orange focus:ring-2 focus:ring-pethood-orange/30";

function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Ingresando…" : "Ingresar"}
    </Button>
  );
}

// GUI-02 equivalente para web-admin — un único login para Admin y Refugio;
// el backend devuelve los roles del usuario y el server action reenvía al dashboard correspondiente.
export default function LoginPage() {
  const [estado, formAction] = useActionState(loginAction, ESTADO_INICIAL);
  const [verPassword, setVerPassword] = useState(false);

  return (
    <div className="grid flex-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image src="/img/refugio.jpg" alt="" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
        <div className="animate-dashboard-in absolute inset-x-0 bottom-0 space-y-3 p-12 text-white">
          <h2 className="font-heading text-4xl leading-tight">Cada mascota merece un hogar.</h2>
          <p className="max-w-md text-lg text-white/85">
            Gestioná refugios, publicaciones y solicitudes de adopción desde un solo lugar.
          </p>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="animate-dashboard-in mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5">
            <Image src="/img/logo.png" alt="" width={44} height={44} priority />
            <span className="font-heading text-2xl text-neutral-900">PetHood</span>
          </Link>

          <form action={formAction}>
            <h1 className="mb-1 font-heading text-3xl text-neutral-900">Bienvenido de nuevo</h1>
            <p className="mb-8 text-base text-neutral-700">Ingresá al panel de administradores y refugios.</p>

            <label className="mb-1 block text-sm font-semibold text-neutral-700" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required className={`${INPUT} mb-4`} />

            <label className="mb-1 block text-sm font-semibold text-neutral-700" htmlFor="password">
              Contraseña
            </label>
            <div className="relative mb-6">
              <input
                id="password"
                name="password"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={`${INPUT} pr-11`}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-800"
              >
                {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {estado.error && (
              <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {estado.error}
              </p>
            )}

            <BotonIngresar />
          </form>
        </div>
      </main>
    </div>
  );
}
