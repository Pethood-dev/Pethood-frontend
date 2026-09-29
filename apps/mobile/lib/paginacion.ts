/**
 * Cuentas puras de la paginación por cursor (estándar de los listados de la app, ver
 * `AGENTS.md`). Viven separadas del hook `usePaginacionCursor` para poder probarlas con
 * `node --test` sin React: por eso no importan nada con el alias `@/`.
 */

/** Una página tal como la devuelve un listado paginado por cursor, ya con sus ítems. */
export interface PaginaCursor<T> {
  items: T[];
  hayMas: boolean;
  proximoCursor: number | null;
}

/**
 * Suma una página nueva al final de lo que ya se ve, sin repetir ítems.
 *
 * El backend garantiza que el cursor no repite, pero un ítem puede estar dos veces igual: el
 * que se insertó arriba a mano al crearlo (ver `agregarAlPrincipio`) vuelve a llegar en una
 * página posterior. Se queda la primera aparición, que es la que el usuario ya estaba viendo.
 */
export function unirPagina<T>(
  actuales: T[],
  nuevos: T[],
  claveDe: (item: T) => number | string,
): T[] {
  const vistos = new Set(actuales.map(claveDe));
  return [...actuales, ...nuevos.filter((item) => !vistos.has(claveDe(item)))];
}

/**
 * Pone un ítem recién creado arriba de todo, sin esperar a recargar: el orden por defecto de
 * los listados es "más reciente primero". Si ya estaba, se mueve y no se duplica.
 */
export function agregarAlPrincipio<T>(
  actuales: T[],
  item: T,
  claveDe: (item: T) => number | string,
): T[] {
  const clave = claveDe(item);
  return [item, ...actuales.filter((actual) => claveDe(actual) !== clave)];
}
