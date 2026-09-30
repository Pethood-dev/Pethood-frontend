/**
 * Textos y reglas de presentación de las campañas (spec 021 del backend). Puro, sin React:
 * se testea con `node --test`.
 */

/** «$1.430.000» como en el diseño; con centavos sólo si los hay («$5.000,50»). */
export function formatearPesos(monto: number): string {
  const [entero, centavos] = Math.abs(monto).toFixed(2).split('.');
  const conPuntos = entero!.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const signo = monto < 0 ? '-' : '';

  return centavos === '00' ? `${signo}$${conPuntos}` : `${signo}$${conPuntos},${centavos}`;
}

export function textoDonantes(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'donante' : 'donantes'}`;
}

/** El aviso de la tarjeta del refugio. Sin pendientes no se muestra nada. */
export function textoPendientes(cantidad: number): string | null {
  if (cantidad === 0) return null;
  return `Tenés ${cantidad} ${cantidad === 1 ? 'donación' : 'donaciones'} para revisar`;
}

export type AccionCampania = 'finalizar' | 'cancelar';

/**
 * Qué puede hacer el refugio con la campaña según su estado. Espejo de la máquina de estados
 * del backend (spec 021 §6.4): el backend igual valida, esto sólo decide qué botones mostrar.
 */
export function accionesDisponibles(estado: string): AccionCampania[] {
  if (estado === 'Activa') return ['finalizar', 'cancelar'];
  if (estado === 'Inactiva') return ['cancelar'];
  return [];
}

/** Motivos de rechazo de una donación, como los ve el refugio. */
export const ETIQUETA_MOTIVO = {
  NO_RECIBIDA: 'No se recibió la transferencia',
  MONTO_NO_COINCIDE: 'El monto no coincide',
} as const;

export type MotivoRechazo = keyof typeof ETIQUETA_MOTIVO;
