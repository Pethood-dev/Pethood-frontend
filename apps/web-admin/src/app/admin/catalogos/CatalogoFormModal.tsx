"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { BodyCatalogo, Catalogo, ItemCatalogo } from "@/types/admin-catalogos";

const INPUT = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900";

// Alta (item null) o edición. Campos según tabla de api-admin-catalogos.md; límites solo UX.
export function CatalogoFormModal({
  catalogo,
  item,
  especies,
  onCerrar,
  onGuardar,
}: {
  catalogo: Catalogo;
  item: ItemCatalogo | null;
  especies: ItemCatalogo[];
  onCerrar: () => void;
  onGuardar: (body: BodyCatalogo) => Promise<void>;
}) {
  const esEstado = catalogo.startsWith("estados-");
  const tieneNombre = !esEstado && catalogo !== "tipos-solicitud";
  const tieneDescripcion = catalogo !== "razas";
  const tieneEspecie = catalogo === "razas" && !item;
  const tieneSecuencia = catalogo === "tipos-solicitud";

  const [nombre, setNombre] = useState(item?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? "");
  const [especieId, setEspecieId] = useState("");
  const [secuencia, setSecuencia] = useState(String(item?.secuenciaDias ?? ""));
  const [enviando, setEnviando] = useState(false);

  const nombreOk = !tieneNombre || (nombre.trim().length >= 2 && nombre.trim().length <= 50);
  const especieOk = !tieneEspecie || especieId !== "";
  const secuenciaOk = !tieneSecuencia || (Number(secuencia) >= 1 && Number(secuencia) <= 365 && Number.isInteger(Number(secuencia)));
  const valido = nombreOk && especieOk && secuenciaOk;

  async function guardar() {
    setEnviando(true);
    const body: BodyCatalogo = {};
    if (tieneNombre) body.nombre = nombre.trim();
    if (tieneDescripcion) body.descripcion = descripcion.trim();
    if (tieneEspecie) body.especieId = Number(especieId);
    if (tieneSecuencia) body.secuenciaDias = Number(secuencia);
    try {
      await onGuardar(body);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={item ? "Editar ítem" : "Nuevo ítem"} onCerrar={onCerrar}>
      <div className="space-y-3">
        {tieneNombre && (
          <label className="block text-sm font-medium text-neutral-700">
            Nombre
            <input className={INPUT} maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
        )}
        {tieneEspecie && (
          <label className="block text-sm font-medium text-neutral-700">
            Especie
            <select className={INPUT} value={especieId} onChange={(e) => setEspecieId(e.target.value)}>
              <option value="">Elegí una especie</option>
              {especies.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        {tieneDescripcion && (
          <label className="block text-sm font-medium text-neutral-700">
            Descripción
            <textarea
              className={INPUT}
              rows={3}
              maxLength={200}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>
        )}
        {tieneSecuencia && (
          <label className="block text-sm font-medium text-neutral-700">
            Secuencia (días, 1 a 365)
            <input
              className={INPUT}
              type="number"
              min={1}
              max={365}
              value={secuencia}
              onChange={(e) => setSecuencia(e.target.value)}
            />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={enviando || !valido}>
            {enviando ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
