/**
 * Valores del manejo del teclado en los formularios. Viven acá y no en cada pantalla para
 * que el desplazamiento sea el mismo en toda la app: si hay que ajustarlo, es un solo número.
 */
export const TECLADO = {
  /**
   * Espacio libre entre el cursor del campo enfocado y el borde superior del teclado.
   *
   * No alcanza con dejar visible el renglón que se escribe: debajo del texto cada campo
   * tiene su pie (contador de caracteres o mensaje de error, ~24 px) y el relleno de la fila
   * o de la caja (~12 px). Con 48 se ve el campo completo con su contador, sin subir la
   * pantalla más de lo necesario.
   */
  margenSobreCampo: 48,
};
