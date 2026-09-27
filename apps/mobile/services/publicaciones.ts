/**
 * Feed de mascotas en adopción y ficha completa de una publicación.
 *
 * El feed ya viene ordenado y sin las mascotas propias ni las que el usuario guardó en
 * favoritos: el cliente no vuelve a filtrar nada, solo pagina.
 */
import { adjuntarArchivo, get, patch, putFormData } from './api';
import type { Genero, Tamanio } from './mascotas';

export interface MascotaPublicada {
  id: number;
  nombre: string | null;
  /** `AAAA-MM-DD` o null. La edad se arma en el cliente con `edadEnTexto`. */
  fechaNacimiento: string | null;
  genero: Genero;
  tamanio: Tamanio | null;
  peso: number | null;
  castrado: boolean;
  descripcion: string | null;
  imagenUrl: string | null;
  especie: { id: number; nombre: string };
  raza: { id: number; nombre: string };
  /** Viene con guión bajo (`En_Transito`). En el feed siempre es `Disponible`. */
  estado: { id: number; nombre: string };
}

/**
 * Estado del AVISO, no de la mascota (catálogo `Estado_Publicacion`):
 * - `Activa`: se ve en el feed y recibe solicitudes.
 * - `Pausada`: sigue viva pero fuera del feed. La pausa quien la gestiona, o sola cuando la
 *   mascota pasa a tratamiento o tránsito. Se reactiva siempre a mano.
 * - `Finalizada`: aviso cerrado para siempre. La finaliza quien la gestiona, o sola cuando
 *   la mascota es adoptada o fallece.
 */
export interface EstadoPublicacion {
  id: number;
  nombre: string;
}

export interface PublicacionFeed {
  id: number;
  titulo: string;
  descripcion: string | null;
  ubicacion: string | null;
  requisitos: string[];
  personalidad: string[];
  desparasitado: boolean;
  vacunas: string | null;
  /** En orden; la primera es la portada. Pasar por `urlAbsoluta` antes de mostrarlas. */
  imagenes: string[];
  fechaPublicacion: string;
  estado: EstadoPublicacion;
  mascota: MascotaPublicada;
  /** Null cuando publica un adoptante particular. */
  refugio: { id: number; nombre: string; direccion: string } | null;
  enFavoritos: boolean;
  /**
   * Si la mascota es del usuario que consulta (o de su mismo refugio). El feed nunca la
   * devuelve en `true`: ya excluye esas publicaciones. La ficha sí puede, y la pantalla usa
   * este campo para no ofrecer "Solicitar adopción" ni el corazón de favoritos sobre la
   * propia mascota.
   */
  esPropia: boolean;
  /**
   * Si la puede editar y cambiarle el estado desde el perfil activo: quien la publicó
   * (perfil personal) o cualquier miembro del refugio dueño. Siempre `false` en el feed.
   */
  puedeEditar: boolean;
}

/** Nombres del catálogo `Estado_Publicacion`, tal como los manda el backend. */
export const ESTADO_PUBLICACION = {
  ACTIVA: 'Activa',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
} as const;

export interface FeedPublicaciones {
  /** Total que matchea los filtros, no el largo de esta página. */
  total: number;
  publicaciones: PublicacionFeed[];
}

/**
 * Filtros de búsqueda. Todos opcionales: un campo `undefined` no viaja y el backend no
 * aplica ese recorte.
 */
export interface FiltrosAdopcion {
  especieId?: number;
  tamanio?: Tamanio;
  genero?: Genero;
  /** Años cumplidos, inclusivo. */
  edadMin?: number;
  /** Años cumplidos, exclusivo: "1–3 años" es `{ edadMin: 1, edadMax: 3 }`. */
  edadMax?: number;
  castrado?: boolean;
  compatibleNinios?: boolean;
  compatibleOtrasMascotas?: boolean;
}

/** Filtros vacíos: el estado inicial de la pantalla y el resultado de "Limpiar". */
export const SIN_FILTROS: FiltrosAdopcion = {};

/** Cuántos recortes hay activos, para el contador del botón "Aplicar filtros (N)". */
export function contarFiltrosActivos(filtros: FiltrosAdopcion): number {
  let activos = 0;

  if (filtros.especieId !== undefined) activos += 1;
  if (filtros.tamanio !== undefined) activos += 1;
  if (filtros.genero !== undefined) activos += 1;
  // El rango de edad es una sola elección del usuario aunque viaje en dos campos.
  if (filtros.edadMin !== undefined || filtros.edadMax !== undefined) activos += 1;
  if (filtros.castrado) activos += 1;
  if (filtros.compatibleNinios) activos += 1;
  if (filtros.compatibleOtrasMascotas) activos += 1;

  return activos;
}

/** Las banderas en false no viajan: su ausencia ya significa "no filtrar por esto". */
function aQueryString(
  filtros: FiltrosAdopcion,
  limite: number,
  desplazamiento: number,
): string {
  const params = new URLSearchParams();

  if (filtros.especieId !== undefined) params.set('especieId', String(filtros.especieId));
  if (filtros.tamanio !== undefined) params.set('tamanio', filtros.tamanio);
  if (filtros.genero !== undefined) params.set('genero', filtros.genero);
  if (filtros.edadMin !== undefined) params.set('edadMin', String(filtros.edadMin));
  if (filtros.edadMax !== undefined) params.set('edadMax', String(filtros.edadMax));
  if (filtros.castrado) params.set('castrado', 'true');
  if (filtros.compatibleNinios) params.set('compatibleNinios', 'true');
  if (filtros.compatibleOtrasMascotas) params.set('compatibleOtrasMascotas', 'true');

  params.set('limite', String(limite));
  params.set('desplazamiento', String(desplazamiento));

  return params.toString();
}

/** Tamaño de página del feed. Coincide con el default del backend. */
export const TAMANIO_PAGINA = 20;

/**
 * El feed excluye como "propias" las mascotas del usuario y las de su refugio. Solo existe
 * en el perfil personal: desde la vista de refugio no se adopta, y el backend lo rechaza.
 */
export function listarFeed(
  filtros: FiltrosAdopcion = SIN_FILTROS,
  desplazamiento = 0,
  limite = TAMANIO_PAGINA,
): Promise<FeedPublicaciones> {
  return get(`/publicaciones?${aQueryString(filtros, limite, desplazamiento)}`);
}

export function obtenerPublicacion(id: number): Promise<PublicacionFeed> {
  return get(`/publicaciones/${id}`);
}

/**
 * En `imagenes`, el lugar de cada foto nueva: la primera marca es la primera de las que se
 * suben en `fotos`, y así. Tiene que coincidir con `MARCADOR_FOTO_NUEVA` del backend.
 */
const MARCADOR_FOTO_NUEVA = 'nueva';

export interface DatosEdicionPublicacion {
  descripcion: string;
  ubicacion: string;
  requisitos: string[];
  personalidad: string[];
  desparasitado: boolean;
  vacunas: string;
  /**
   * Galería final en orden (la primera es la portada): las que ya estaban traen `remota`, las
   * nuevas no. Vacía, vuelve a usar la foto de la mascota.
   */
  fotos: { uri: string; nombre: string; tipo: string; remota?: string }[];
}

/**
 * Reemplaza todos los datos editables de la publicación (todo menos la mascota) y devuelve
 * la ficha actualizada. Mismo multipart que el alta; el orden de la galería viaja en
 * `imagenes`, con las existentes por su ruta y las nuevas marcadas.
 */
export async function editarPublicacion(
  id: number,
  datos: DatosEdicionPublicacion,
): Promise<PublicacionFeed> {
  const formData = new FormData();

  formData.append('descripcion', datos.descripcion);
  formData.append('ubicacion', datos.ubicacion);
  formData.append('desparasitado', String(datos.desparasitado));
  formData.append('vacunas', datos.vacunas);

  // Repetir la clave es como viaja una lista en multipart.
  for (const requisito of datos.requisitos) formData.append('requisitos', requisito);
  for (const rasgo of datos.personalidad) formData.append('personalidad', rasgo);

  for (const foto of datos.fotos) {
    formData.append('imagenes', foto.remota ?? MARCADOR_FOTO_NUEVA);
    if (!foto.remota) await adjuntarArchivo(formData, 'fotos', foto);
  }

  return putFormData(`/publicaciones/${id}`, formData);
}

/** Cambios de estado manuales. Ver `EstadoPublicacion` para qué puede ir a qué. */
export type AccionEstadoPublicacion = 'PAUSAR' | 'REACTIVAR' | 'FINALIZAR';

/** Pausa, reactiva o finaliza la publicación y devuelve la ficha con el estado nuevo. */
export function cambiarEstadoPublicacion(
  id: number,
  accion: AccionEstadoPublicacion,
): Promise<PublicacionFeed> {
  return patch(`/publicaciones/${id}/estado`, { accion });
}

/** Tarjeta de "Mis publicaciones". La ficha completa se pide con `obtenerPublicacion`. */
export interface PublicacionPropia {
  id: number;
  /** Portada. Pasar por `urlAbsoluta` antes de mostrarla. */
  imagenUrl: string | null;
  fechaPublicacion: string;
  estado: EstadoPublicacion;
  mascota: {
    id: number;
    nombre: string | null;
    /** `AAAA-MM-DD` o null. */
    fechaNacimiento: string | null;
    especie: { id: number; nombre: string };
  };
}

/**
 * Publicaciones del perfil activo, la más nueva primero: las de sus mascotas personales, o
 * todas las del refugio desde la vista de refugio (cabecera `X-Ambito`). Con `estadoIds`
 * trae solo las que están en alguno de esos estados; vacío es "todas".
 */
export function listarMisPublicaciones(estadoIds: number[] = []): Promise<PublicacionPropia[]> {
  const filtro = estadoIds.length > 0 ? `?estados=${estadoIds.join(',')}` : '';
  return get(`/publicaciones/mias${filtro}`);
}
