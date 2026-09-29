/**
 * Color de cada estado del aviso de mascota perdida (HU-13.1), en un solo lugar (mismo
 * patrón que EstadosMascota.ts).
 *
 * Perdido y Encontrado salen de la pantalla 06 del diseño: amarillo claro y crema, las dos
 * con la tinta `accent-800`. Resuelto no está en el diseño: va apagado, en neutros, para que
 * se lea como un caso cerrado (decisión del 2026-09-29).
 *
 * Las claves son los nombres del catálogo `Estado_Animal_Perdido` del backend. Un estado
 * nuevo sin entrada propia cae al estilo neutro.
 */
import type { EstiloEstado } from './EstadosMascota';

const ESTILOS: Record<string, EstiloEstado> = {
  Perdido: {
    fondo: 'bg-organic-calido-amarilloClaro border-organic-calido-amarilloClaro',
    texto: 'text-organic-accent-800',
    etiqueta: 'Perdido',
  },
  Encontrado: {
    fondo: 'bg-organic-neutral-100 border-organic-neutral-100',
    texto: 'text-organic-accent-800',
    etiqueta: 'Encontrado',
  },
  Resuelto: {
    fondo: 'bg-organic-neutral-200 border-organic-neutral-200',
    texto: 'text-organic-neutral-600',
    etiqueta: 'Resuelto',
  },
};

export function estiloDeEstadoAnimalPerdido(nombre: string): EstiloEstado {
  return (
    ESTILOS[nombre] ?? {
      fondo: 'bg-organic-neutral-100 border-organic-neutral-100',
      texto: 'text-organic-neutral-700',
      etiqueta: nombre.replace(/_/g, ' '),
    }
  );
}
