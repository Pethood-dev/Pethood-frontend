"use client";

import { useState, type ReactNode } from "react";
import { ErrorCampo } from "@/components/ui/ErrorCampo";
import { useTocados } from "@/lib/useTocados";
import {
  hayErrores,
  LIMITES,
  validarConfirmacion,
  validarEmail,
  validarImagen,
  validarNombrePersona,
  validarPasswordNueva,
  validarTelefono,
  validarTexto,
} from "@/lib/validation";

const VACIO = { nombre: "", apellido: "", email: "", pass: "", pass2: "", rnombre: "", rdir: "", rtel: "", remail: "", rdesc: "" };
type Campo = keyof typeof VACIO;

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend>{titulo}</legend>
      <div className="fields">{children}</div>
    </fieldset>
  );
}

// Maqueta del registro de refugio (HU-1.1 / HU-2.4): valida en el cliente pero todavía no envía datos.
export function RegistroRefugioForm() {
  const [v, setV] = useState(VACIO);
  const [imagen, setImagen] = useState<File | null>(null);
  const [listo, setListo] = useState(false);
  const { ver, tocar, intentarEnviar } = useTocados();

  const errores: Record<Campo | "rimg", string | null> = {
    nombre: validarNombrePersona(v.nombre, "El nombre"),
    apellido: validarNombrePersona(v.apellido, "El apellido"),
    email: validarEmail(v.email),
    pass: validarPasswordNueva(v.pass),
    pass2: validarConfirmacion(v.pass, v.pass2),
    rnombre: validarTexto(v.rnombre, { etiqueta: "El nombre del refugio", ...LIMITES.refugio.nombre }),
    rdir: validarTexto(v.rdir, { etiqueta: "La dirección", ...LIMITES.refugio.direccion }),
    rtel: validarTelefono(v.rtel, false),
    remail: validarEmail(v.remail, false),
    rdesc: validarTexto(v.rdesc, { etiqueta: "La descripción", ...LIMITES.refugio.descripcion, obligatorio: false }),
    rimg: validarImagen(imagen),
  };

  const campo = (id: Campo, label: string, o: { tipo?: string; auto?: string; full?: boolean; hint?: string; max?: number } = {}) => (
    <div className={o.full ? "full" : undefined}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={o.tipo ?? "text"}
        autoComplete={o.auto}
        maxLength={o.max}
        value={v[id]}
        onChange={(e) => setV((prev) => ({ ...prev, [id]: e.target.value }))}
        onBlur={() => tocar(id)}
        aria-invalid={!!ver(id, errores[id])}
        aria-describedby={`${id}-error`}
      />
      {o.hint && !ver(id, errores[id]) && <p className="hint">{o.hint}</p>}
      <ErrorCampo id={id} error={ver(id, errores[id])} />
    </div>
  );

  return (
    <form
      aria-label="Registro de refugio u ONG"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        intentarEnviar();
        setListo(!hayErrores(errores));
      }}
    >
      <Grupo titulo="Tus datos">
        {campo("nombre", "Nombre *", { auto: "given-name", max: LIMITES.persona.nombre.max })}
        {campo("apellido", "Apellido *", { auto: "family-name", max: LIMITES.persona.nombre.max })}
        {campo("email", "Email *", { tipo: "email", auto: "email", full: true, max: 100 })}
        {campo("pass", "Contraseña *", { tipo: "password", auto: "new-password", hint: "Mínimo 8 caracteres, con una mayúscula y un número." })}
        {campo("pass2", "Confirmar contraseña *", { tipo: "password", auto: "new-password" })}
      </Grupo>
      <Grupo titulo="Datos del refugio">
        {campo("rnombre", "Nombre del refugio / ONG *", { full: true, max: LIMITES.refugio.nombre.max })}
        {campo("rdir", "Dirección *", { auto: "street-address", full: true, max: LIMITES.refugio.direccion.max })}
        {campo("rtel", "Teléfono", { tipo: "tel", max: 20 })}
        {campo("remail", "Email del refugio", { tipo: "email", max: 100 })}
        <div className="full">
          <label htmlFor="rdesc">Descripción</label>
          <textarea
            id="rdesc"
            rows={3}
            maxLength={LIMITES.refugio.descripcion.max}
            value={v.rdesc}
            onChange={(e) => setV((prev) => ({ ...prev, rdesc: e.target.value }))}
            onBlur={() => tocar("rdesc")}
            aria-invalid={!!ver("rdesc", errores.rdesc)}
            aria-describedby="rdesc-error"
          />
          <ErrorCampo id="rdesc" error={ver("rdesc", errores.rdesc)} />
        </div>
        <div className="full">
          <label htmlFor="rimg">Logo o foto del refugio</label>
          <input
            id="rimg"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setImagen(e.target.files?.[0] ?? null);
              tocar("rimg");
            }}
            aria-invalid={!!ver("rimg", errores.rimg)}
            aria-describedby="rimg-error"
          />
          <p className="hint">JPG, PNG o WEBP, hasta 5 MB.</p>
          <ErrorCampo id="rimg" error={ver("rimg", errores.rimg)} />
        </div>
      </Grupo>
      <div className="actions">
        <p className="hint">{listo ? "Datos válidos. Maqueta: todavía no envía datos." : "Maqueta: todavía no envía datos."}</p>
        <button type="submit" className="btn">
          Registrar refugio
        </button>
      </div>
    </form>
  );
}
