/**
 * Avisos de mascotas perdidas y encontradas (HU-13.1). Contrato completo en
 * `pethood-backend/docs/api-mascotas-perdidas.md`.
 */
import { LIMITES } from '@/shared/validation/limits';
import { aFechaISO } from '@/shared/validation/dates';

import { adjuntarArchivo, get, postFormData } from './api';

/** Una tarjeta del portal, igual en el listado que en la respuesta del alta. */
export interface AvisoPerdido {
  id: number;
  /** `null` en un aviso "Encontrado" sin nombre: la tarjeta dice "Sin nombre". */
  nombre: string | null;
  descripcion: string;
  /** Portada de la tarjeta. Ruta relativa o URL absoluta: siempre pasa por `urlAbsoluta`. */
  imagenUrl: string;
  /** De 1 a 5, en el orden de la galería del detalle; la primera es `imagenUrl`. */
  imagenes: string[];
  /** Texto libre. `null` sólo en avisos cargados antes de HU-13.1. */
  ubicacion: string | null;
  estado: { id: number; nombre: string };
  /** `null` sólo en avisos cargados antes de HU-13.1. */
  especie: { id: number; nombre: string } | null;
  /**
   * Día en que se perdió o se encontró, `AAAA-MM-DD` (sin hora). No es la fecha de
   * publicación. `null` sólo en avisos cargados antes de que existiera el campo.
   */
  fechaSuceso: string | null;
  /** ISO 8601. Define el orden del portal. */
  fechaAlta: string;
  fechaResuelto: string | null;
  /** Contraparte del chat de reencuentro (HU-13.2, todavía sin implementar). */
  reportante: { id: number; nombre: string; apellido: string; imagenUrl: string | null };
  /** Con `true` el aviso es del usuario: no se le ofrece escribirse a sí mismo. */
  esPropio: boolean;
}

/** Una página del portal, paginado por cursor (estándar de listados de la app). */
export interface PaginaAvisos {
  avisos: AvisoPerdido[];
  hayMas: boolean;
  proximoCursor: number | null;
}

/**
 * Filtros del portal. Todas las listas vacías (o ausentes) son "sin filtro". La fecha es
 * sobre la fecha de publicación del aviso, y "hasta" sólo vale junto con "desde".
 */
export interface FiltrosPerdidos {
  estados: number[];
  especies: number[];
  /** Ubicaciones tal cual las devuelve `listarUbicaciones` (texto libre). */
  ubicaciones: string[];
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export const SIN_FILTROS_PERDIDOS: FiltrosPerdidos = { estados: [], especies: [], ubicaciones: [] };

/** Para la pastilla "Filtros (N)" y el botón "Aplicar filtros (N activos)". */
export function contarFiltrosActivosPerdidos(filtros: FiltrosPerdidos): number {
  let activos = 0;

  // Elegir varias opciones de una misma sección es una sola elección del usuario.
  if (filtros.estados.length > 0) activos += 1;
  if (filtros.especies.length > 0) activos += 1;
  if (filtros.ubicaciones.length > 0) activos += 1;
  // El rango de fecha también cuenta como uno, aunque viaje en dos campos.
  if (filtros.fechaDesde !== undefined) activos += 1;

  return activos;
}

/**
 * Query del portal. `ubicaciones` NO se separa por coma como el resto: es texto libre y
 * puede tenerla ("Godoy Cruz, Mendoza"), así que va un parámetro por valor.
 */
function queryDelPortal(filtros: FiltrosPerdidos, cursor: number | null): string {
  const params = new URLSearchParams({ limite: String(LIMITES.animalPerdido.pagina.porDefecto) });

  if (cursor !== null) params.set('cursor', String(cursor));
  if (filtros.estados.length > 0) params.set('estados', filtros.estados.join(','));
  if (filtros.especies.length > 0) params.set('especies', filtros.especies.join(','));
  for (const ubicacion of filtros.ubicaciones) params.append('ubicaciones', ubicacion);
  if (filtros.fechaDesde) params.set('fechaDesde', aFechaISO(filtros.fechaDesde));
  if (filtros.fechaDesde && filtros.fechaHasta) {
    params.set('fechaHasta', aFechaISO(filtros.fechaHasta));
  }

  return `?${params.toString()}`;
}

/**
 * GUI-06. Una página del portal: la primera con `cursor` en `null`, y las siguientes con el
 * `proximoCursor` de la anterior y LOS MISMOS filtros.
 */
export function listarAvisos(
  filtros: FiltrosPerdidos,
  cursor: number | null,
): Promise<PaginaAvisos> {
  return get(`/animales-perdidos${queryDelPortal(filtros, cursor)}`);
}

export interface DatosNuevoAviso {
  estadoId: number;
  /** Vacío en un aviso "Encontrado" sin nombre: el backend lo guarda como `null`. */
  nombre: string;
  especieId: number;
  descripcion: string;
  ubicacion: string;
  fechaSuceso: Date;
  latitud: number;
  longitud: number;
  /** De 1 a 5, en el orden de la galería: la primera es la portada. */
  fotos: { uri: string; nombre: string; tipo: string }[];
}

/**
 * GUI-25. Publica el aviso (multipart, con las fotos en `fotos`) y devuelve la misma tarjeta
 * que el portal, lista para insertarla arriba sin recargar.
 */
export async function crearAviso(datos: DatosNuevoAviso): Promise<AvisoPerdido> {
  const formData = new FormData();

  formData.append('estadoId', String(datos.estadoId));
  formData.append('nombre', datos.nombre);
  formData.append('especieId', String(datos.especieId));
  formData.append('descripcion', datos.descripcion);
  formData.append('ubicacion', datos.ubicacion);
  formData.append('fechaSuceso', aFechaISO(datos.fechaSuceso));
  // Sin redondear: el backend guarda todos los decimales que entrega el GPS.
  formData.append('latitud', String(datos.latitud));
  formData.append('longitud', String(datos.longitud));
  // Una por una y en orden: el backend toma ese orden como el de la galería.
  for (const foto of datos.fotos) {
    await adjuntarArchivo(formData, 'fotos', foto);
  }

  return postFormData('/animales-perdidos', formData);
}

/** Opciones del filtro de localidad: las ubicaciones que ya tienen los avisos. */
export function listarUbicaciones(): Promise<string[]> {
  return get('/animales-perdidos/ubicaciones');
}
