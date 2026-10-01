/**
 * Avisos de mascotas perdidas y encontradas: alta y portal (HU-13.1), reclamo y cierre del
 * caso (HU-13.2). Contrato completo en `pethood-backend/docs/api-mascotas-perdidas.md`.
 */
import type { Coordenadas } from '@/lib/ubicacion';
import { LIMITES } from '@/shared/validation/limits';
import { aFechaISO } from '@/shared/validation/dates';
import type { UbicacionPreview } from '@/types/auth';

import { adjuntarArchivo, get, post, postFormData } from './api';

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
  /**
   * El lugar listo para mostrar, con el mismo formato que la dirección del perfil:
   * "referencia, localidad - provincia". `null` sólo en avisos cargados antes de HU-13.1.
   */
  ubicacion: string | null;
  /** Del catálogo de georef, como en el perfil. `null` en avisos viejos. */
  provincia: string | null;
  localidad: string | null;
  /** El aclaratorio libre del lugar ("frente a la plaza"), si se cargó. */
  referencia: string | null;
  /**
   * Kilómetros desde la ubicación de quien mira hasta el lugar del aviso, con un decimal. Sólo
   * si se pidió el listado con coordenadas y el lugar se pudo ubicar en el mapa.
   */
  distanciaKm: number | null;
  /**
   * Link a Google Maps del lugar: con el punto exacto si se pudo ubicar, o buscando el texto
   * del lugar si no. Nunca apunta a dónde estaba quien reportó.
   */
  mapaUrl: string | null;
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
  /** Contraparte del chat de reencuentro (HU-13.2). */
  reportante: { id: number; nombre: string; apellido: string; imagenUrl: string | null };
  /**
   * Con `true` el aviso es del usuario. Decide qué botón ofrece el detalle: con `false`,
   * "Enviar mensaje"; con `true`, "Marcar como resuelto".
   */
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
  /** Vacío es "todas". */
  provincias: string[];
  /**
   * Vacío es "todas las de las provincias elegidas". Cada una con su provincia: el mismo nombre
   * de localidad existe en varias. Con alguna elegida, el portal muestra sólo esas.
   */
  localidades: LocalidadElegida[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  /**
   * Radio del filtro por cercanía, en km. Sin valor es "Ninguno". Se mide desde las
   * coordenadas que se le pasan a `listarAvisos`: sin ellas no se aplica.
   */
  radioKm?: number;
}

export interface LocalidadElegida {
  provincia: string;
  localidad: string;
}

export const SIN_FILTROS_PERDIDOS: FiltrosPerdidos = {
  estados: [],
  especies: [],
  provincias: [],
  localidades: [],
};

/** Para la pastilla "Filtros (N)" y el botón "Aplicar filtros (N activos)". */
export function contarFiltrosActivosPerdidos(filtros: FiltrosPerdidos): number {
  let activos = 0;

  // Elegir varias opciones de una misma sección es una sola elección del usuario.
  if (filtros.estados.length > 0) activos += 1;
  if (filtros.especies.length > 0) activos += 1;
  // Provincias y localidades son una sola elección: dónde buscar.
  if (filtros.provincias.length > 0 || filtros.localidades.length > 0) activos += 1;
  // El rango de fecha también cuenta como uno, aunque viaje en dos campos.
  if (filtros.fechaDesde !== undefined) activos += 1;
  // "Ninguno" no es un filtro.
  if (filtros.radioKm !== undefined) activos += 1;

  return activos;
}

/**
 * Query del portal. `provincias` y `localidades` NO se separan por coma como el resto: hay
 * nombres del catálogo que la tienen, así que va un parámetro por valor. Cada localidad viaja
 * como «provincia|localidad».
 */
function queryDelPortal(
  filtros: FiltrosPerdidos,
  cursor: number | null,
  coordenadas: Coordenadas | null,
): string {
  const params = new URLSearchParams({ limite: String(LIMITES.animalPerdido.pagina.porDefecto) });

  if (cursor !== null) params.set('cursor', String(cursor));
  if (filtros.estados.length > 0) params.set('estados', filtros.estados.join(','));
  if (filtros.especies.length > 0) params.set('especies', filtros.especies.join(','));
  for (const provincia of filtros.provincias) params.append('provincias', provincia);
  for (const { provincia, localidad } of filtros.localidades) {
    params.append('localidades', `${provincia}|${localidad}`);
  }
  if (filtros.fechaDesde) params.set('fechaDesde', aFechaISO(filtros.fechaDesde));
  if (filtros.fechaDesde && filtros.fechaHasta) {
    params.set('fechaHasta', aFechaISO(filtros.fechaHasta));
  }
  // Las coordenadas viajan siempre que las haya: con ellas cada tarjeta trae su distancia. El
  // radio, sólo junto con ellas (el backend lo rechaza suelto).
  if (coordenadas) {
    params.set('latitud', String(coordenadas.latitud));
    params.set('longitud', String(coordenadas.longitud));
    if (filtros.radioKm !== undefined) params.set('radioKm', String(filtros.radioKm));
  }

  return `?${params.toString()}`;
}

/**
 * GUI-06. Una página del portal: la primera con `cursor` en `null`, y las siguientes con el
 * `proximoCursor` de la anterior y LOS MISMOS filtros. `coordenadas` son las del teléfono de
 * quien mira, si las dio: sin ellas no hay distancia ni filtro por cercanía.
 */
export function listarAvisos(
  filtros: FiltrosPerdidos,
  cursor: number | null,
  coordenadas: Coordenadas | null,
): Promise<PaginaAvisos> {
  return get(`/animales-perdidos${queryDelPortal(filtros, cursor, coordenadas)}`);
}

export interface DatosNuevoAviso {
  estadoId: number;
  /** Vacío en un aviso "Encontrado" sin nombre: el backend lo guarda como `null`. */
  nombre: string;
  especieId: number;
  descripcion: string;
  /** Del catálogo, como en el perfil. */
  provincia: string;
  localidad: string;
  /** Opcional: vacía no viaja. */
  referencia: string;
  /**
   * El punto del lugar que el usuario vio en el mapa: el del preview o el del link que pegó a
   * mano. Sin él, el backend geocodifica el lugar al publicar.
   */
  puntoDelLugar: Coordenadas | null;
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
  formData.append('provincia', datos.provincia);
  formData.append('localidad', datos.localidad);
  if (datos.referencia) formData.append('referencia', datos.referencia);
  if (datos.puntoDelLugar) {
    formData.append('lugarLatitud', String(datos.puntoDelLugar.latitud));
    formData.append('lugarLongitud', String(datos.puntoDelLugar.longitud));
  }
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

/**
 * Ubica el lugar en el mapa SIN publicar nada, para mostrar el link de Google Maps y que el
 * usuario verifique el pin antes de publicar, como la dirección del perfil.
 */
export async function ubicarLugar(lugar: {
  provincia: string;
  localidad: string;
  referencia: string;
}): Promise<UbicacionPreview> {
  const respuesta = await post<{ lugar: UbicacionPreview }>('/animales-perdidos/lugar/preview', {
    provincia: lugar.provincia,
    localidad: lugar.localidad,
    // Vacía no viaja: el backend la trata como "sin referencia".
    ...(lugar.referencia.trim() ? { referencia: lugar.referencia.trim() } : {}),
  });
  return respuesta.lugar;
}

/** El "corregir a mano": lee el punto de un link de Google Maps (también los cortos). */
export async function leerLinkMapa(mapaUrl: string): Promise<UbicacionPreview> {
  const respuesta = await post<{ lugar: UbicacionPreview }>('/animales-perdidos/lugar/link', {
    mapaUrl,
  });
  return respuesta.lugar;
}

/** Una provincia con avisos y sus localidades con avisos, las dos en orden alfabético. */
export interface ProvinciaConLocalidades {
  provincia: string;
  localidades: string[];
}

/**
 * Opciones del filtro por lugar: sólo los lugares que ya tienen avisos, así el filtro nunca
 * ofrece uno sin resultados.
 */
export function listarUbicaciones(): Promise<ProvinciaConLocalidades[]> {
  return get('/animales-perdidos/ubicaciones');
}

// ─────────────── HU-13.2 · Reclamo y cierre del caso ───────────────

/** El estado que cierra el caso, tal como lo nombra el catálogo del backend. */
export const ESTADO_RESUELTO = 'Resuelto';

/** Si el aviso ya está cerrado: no se reclama ni se vuelve a resolver. */
export function estaResuelto(aviso: AvisoPerdido): boolean {
  return aviso.estado.nombre === ESTADO_RESUELTO;
}

/** La conversación que devuelve el reclamo. */
export interface ReclamoAviso {
  chatId: number;
  /**
   * `true` sólo si hubo que **abrir** la conversación. Con `false` ya existía una con esa
   * persona —por una adopción, o por otro aviso— y el reclamo entró ahí.
   */
  nueva: boolean;
}

/**
 * Reclama el aviso y devuelve la conversación con quien lo publicó, para navegar a ella.
 *
 * Es idempotente del lado del backend (responde 200, no 201): volver a tocar el botón devuelve
 * la misma conversación y no repite la tarjeta del aviso.
 */
export function reclamarAviso(id: number): Promise<ReclamoAviso> {
  // Sin cuerpo: el endpoint no recibe body.
  return post(`/animales-perdidos/${id}/reclamo`, {});
}

/**
 * Cierra el **caso**: el aviso pasa a "Resuelto" y el portal lo marca con "Volvió con su dueño".
 *
 * **No cierra ninguna conversación** — decisión del equipo del 2026-10-01, ver la spec 024 §9.
 * Las dos personas siguen pudiendo escribirse, que es justamente cuando coordinan la entrega.
 *
 * Devuelve la tarjeta ya actualizada para reemplazar el aviso en memoria, sin refetch del portal.
 */
export function resolverAviso(id: number): Promise<AvisoPerdido> {
  return post(`/animales-perdidos/${id}/resuelto`, {});
}
