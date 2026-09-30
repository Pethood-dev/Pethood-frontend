"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AccionButton } from "@/components/ui/AccionButton";
import { Button } from "@/components/ui/Button";
import { Feedback } from "@/components/ui/Feedback";
import { Pagination } from "@/components/ui/Pagination";
import { useTablaAdmin } from "@/lib/useTablaAdmin";
import {
  bajaItemCatalogo,
  crearItemCatalogo,
  editarItemCatalogo,
  reactivarItemCatalogo,
} from "@/services/admin-catalogos";
import { ApiError } from "@/services/api";
import { CATALOGOS } from "@/types/admin-catalogos";
import type { BodyCatalogo, Catalogo, FiltrosCatalogo, ItemCatalogo, ListaCatalogo } from "@/types/admin-catalogos";
import { CatalogoFormModal } from "./CatalogoFormModal";

// Solo estos dos admiten reactivar (api-admin-catalogos.md).
const REACTIVABLES: Catalogo[] = ["especies", "razas"];

const CAMPO = "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900";

export function CatalogosTabla({
  catalogo,
  lista,
  filtros,
  especies,
  token,
}: {
  catalogo: Catalogo;
  lista: ListaCatalogo;
  filtros: FiltrosCatalogo;
  especies: ItemCatalogo[];
  token: string;
}) {
  const { cargando, error, exito, ejecutar, aplicarFiltros, irAPagina } = useTablaAdmin("/admin/catalogos", {
    ...filtros,
    catalogo,
  });
  const [modal, setModal] = useState<{ item: ItemCatalogo | null } | null>(null);
  const { permisos } = lista;

  async function guardar(body: BodyCatalogo) {
    const item = modal?.item;
    const ok = await ejecutar(
      item?.id ?? "nuevo",
      () => (item ? editarItemCatalogo(catalogo, item.id, body, token) : crearItemCatalogo(catalogo, body, token)),
      item ? "Ítem actualizado correctamente." : "Ítem creado correctamente.",
    );
    if (ok) setModal(null);
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Catálogos" className="flex flex-wrap gap-2">
        {CATALOGOS.map((c) => (
          <Link
            key={c.id}
            href={`/admin/catalogos?catalogo=${c.id}`}
            aria-current={c.id === catalogo ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              c.id === catalogo
                ? "border-pethood-orange bg-pethood-orange text-white"
                : "border-neutral-300 bg-neutral-100 text-neutral-700 hover:border-pethood-orange hover:text-pethood-orange-dark"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <label className="text-xs font-medium text-neutral-600">
          <span className="mb-1 block">Buscar</span>
          <input
            type="text"
            defaultValue={filtros.q ?? ""}
            placeholder="Nombre"
            className={CAMPO}
            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros({ q: e.currentTarget.value })}
          />
        </label>
        {permisos.baja && (
          <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              defaultChecked={filtros.incluirBajas === "true"}
              onChange={(e) => aplicarFiltros({ incluirBajas: e.target.checked ? "true" : undefined })}
            />
            Incluir bajas
          </label>
        )}
        {permisos.alta && (
          <div className="ml-auto">
            <Button onClick={() => setModal({ item: null })}>
              <Plus size={16} className="mr-1 inline" />
              Nuevo
            </Button>
          </div>
        )}
      </div>

      {error && !modal && <Feedback tipo="error" mensaje={error} />}
      {exito && <Feedback tipo="exito" mensaje={exito} />}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="tabla-apilable w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-center">Nombre</th>
              <th className="px-4 py-3 text-center">Descripción</th>
              <th className="px-4 py-3 text-center">Detalle</th>
              <th className="px-4 py-3 text-center">Usos</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No hay ítems que coincidan con los filtros.
                </td>
              </tr>
            )}
            {lista.items.map((item) => {
              const deBaja = item.fechaBaja !== null;
              const bloqueo = item.bloqueoBaja;
              const detalle = [
                typeof item.especie === "string" ? item.especie : item.especie?.nombre,
                item.secuenciaDias ? `cada ${item.secuenciaDias} días` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <tr key={`${item.id}-${typeof item.especie === "string" ? item.especie : ""}`} className="border-b border-neutral-100 last:border-0">
                  <td data-label="Nombre" className="px-4 py-3 text-center text-neutral-900">{item.nombre}</td>
                  <td data-label="Descripción" className="px-4 py-3 text-center text-neutral-600">{item.descripcion ?? "—"}</td>
                  <td data-label="Detalle" className="px-4 py-3 text-center text-neutral-600">{detalle || "—"}</td>
                  <td data-label="Usos" className="px-4 py-3 text-center text-neutral-600">{item.cantidadUsos}</td>
                  <td data-label="Estado" className="px-4 py-3 text-center text-neutral-600">{deBaja ? "De baja" : "Vigente"}</td>
                  <td data-label="Acciones" className="px-4 py-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {permisos.edicion && !deBaja && (
                        <AccionButton icono={Pencil} tono="neutral" onClick={() => setModal({ item })}>
                          Editar
                        </AccionButton>
                      )}
                      {/* CATALOGO_SIN_BAJA: sin botón. YA_DE_BAJA: reactivar. EN_USO: deshabilitado con motivo. */}
                      {permisos.baja && deBaja && REACTIVABLES.includes(catalogo) && (
                        <AccionButton
                          icono={RotateCcw}
                          tono="exito"
                          disabled={cargando === item.id}
                          onClick={() =>
                            ejecutar(item.id, () => reactivarItemCatalogo(catalogo, item.id, token), "Ítem reactivado correctamente.")
                          }
                        >
                          Reactivar
                        </AccionButton>
                      )}
                      {permisos.baja && !deBaja && bloqueo?.codigo !== "CATALOGO_SIN_BAJA" && (
                        <AccionButton
                          icono={Trash2}
                          tono="peligro"
                          disabled={!item.puedeDarseDeBaja || cargando === item.id}
                          title={bloqueo?.mensaje}
                          onClick={() =>
                            ejecutar(item.id, () => bajaItemCatalogo(catalogo, item.id, token), "Ítem dado de baja correctamente.")
                          }
                        >
                          Dar de baja
                        </AccionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={lista.page} limit={lista.limit} total={lista.total} onCambiar={irAPagina} />

      {modal && (
        <CatalogoFormModal
          catalogo={catalogo}
          item={modal.item}
          especies={especies}
          error={error}
          onCerrar={() => setModal(null)}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}
