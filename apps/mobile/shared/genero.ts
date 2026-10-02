/**
 * Concuerda en género gramatical un texto según el sexo de la mascota, para no mostrar
 * "castrado" en una hembra ni "esterilizada" en un macho.
 *
 * Mientras no se eligió el sexo (formulario de alta a medio completar) se muestra el
 * masculino, que es la forma neutra que ya usaba toda la app.
 */
import type { Genero } from '@/services/mascotas';

export function textoSegunGenero(
  genero: Genero | null | undefined,
  masculino: string,
  femenino: string,
): string {
  return genero === 'HEMBRA' ? femenino : masculino;
}

/**
 * Forma femenina de cada rasgo de personalidad, solo para mostrar. Los rasgos se guardan y
 * viajan al backend siempre en masculino (el filtro de Adoptar matchea "Bueno con chicos" y
 * "Bueno con otras mascotas" por texto exacto): lo que cambia es la etiqueta, nunca el dato.
 * Un rasgo que no está acá (los que no tienen género, como "Sociable") se muestra tal cual.
 */
const RASGO_FEMENINO: Partial<Record<string, string>> = {
  Juguetón: 'Juguetona',
  Cariñoso: 'Cariñosa',
  Tranquilo: 'Tranquila',
  Activo: 'Activa',
  Protector: 'Protectora',
  'Bueno con chicos': 'Buena con chicos',
  'Bueno con otras mascotas': 'Buena con otras mascotas',
};

/** Un rasgo de personalidad concordado con el sexo de la mascota, para mostrarlo. */
export function rasgoSegunGenero(genero: Genero | null | undefined, rasgo: string): string {
  return textoSegunGenero(genero, rasgo, RASGO_FEMENINO[rasgo] ?? rasgo);
}
