/**
 * Color de cada estado de publicación, en un solo lugar (mismo patrón que EstadosMascota.ts).
 *
 * Es el estado del AVISO, no el de la mascota. Las claves son los nombres tal como los
 * devuelve el catálogo `Estado_Publicacion` del backend. Si se agrega un estado nuevo allá,
 * sumarlo acá: sin entrada propia cae al estilo neutro.
 */
import type { EstiloEstado } from './EstadosMascota';

const ESTILOS: Record<string, EstiloEstado> = {
  Activa: {
    fondo: 'bg-emerald-50 border-emerald-200',
    texto: 'text-emerald-700',
    etiqueta: 'Activa',
  },
  Pausada: {
    fondo: 'bg-amber-50 border-amber-200',
    texto: 'text-amber-700',
    etiqueta: 'Pausada',
  },
  Finalizada: {
    fondo: 'bg-gray-100 border-gray-300',
    texto: 'text-gray-500',
    etiqueta: 'Finalizada',
  },
};

/**
 * Banner de estado de la ficha de la publicación: la versión grande de la pastilla, con los
 * mismos tonos, un ícono en un círculo relleno y qué implica cada estado.
 */
export interface EstiloBannerEstado {
  /** Fondo y borde del banner. */
  contenedor: string;
  /** Fondo del círculo del ícono. */
  circulo: string;
  titulo: string;
  detalle: string;
  icono: 'broadcast' | 'pause' | 'flag-checkered';
  explicacion: string;
}

const BANNERS: Record<string, EstiloBannerEstado> = {
  Activa: {
    contenedor: 'bg-emerald-50 border-emerald-300',
    circulo: 'bg-emerald-600',
    titulo: 'text-emerald-900',
    detalle: 'text-emerald-800',
    icono: 'broadcast',
    explicacion: 'Se ve en Adoptar y recibe solicitudes',
  },
  Pausada: {
    contenedor: 'bg-amber-50 border-amber-300',
    circulo: 'bg-amber-500',
    titulo: 'text-amber-900',
    detalle: 'text-amber-800',
    icono: 'pause',
    explicacion: 'No aparece en Adoptar ni recibe solicitudes',
  },
  Finalizada: {
    contenedor: 'bg-gray-100 border-gray-300',
    circulo: 'bg-gray-500',
    titulo: 'text-gray-800',
    detalle: 'text-gray-600',
    icono: 'flag-checkered',
    explicacion: 'Cerrada: ya no se puede reactivar ni editar',
  },
};

/** Un estado que el backend sume antes que la app se ve neutro y sin explicación. */
export function estiloDeBannerPublicacion(nombre: string): EstiloBannerEstado {
  return BANNERS[nombre] ?? { ...BANNERS.Finalizada!, explicacion: '' };
}

export function estiloDeEstadoPublicacion(nombre: string): EstiloEstado {
  return (
    ESTILOS[nombre] ?? {
      fondo: 'bg-gray-100 border-gray-200',
      texto: 'text-gray-600',
      etiqueta: nombre.replace(/_/g, ' '),
    }
  );
}
