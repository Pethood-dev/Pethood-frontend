"use client";

import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  /** Clase de ancho máximo. Por defecto `max-w-lg`. */
  ancho?: string;
}

export function Modal({ titulo, onCerrar, children, ancho = "max-w-lg" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className={`max-h-[90vh] w-full ${ancho} overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-neutral-400 hover:text-neutral-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
