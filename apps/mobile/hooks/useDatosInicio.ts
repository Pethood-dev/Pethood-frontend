/**
 * Carga de la pantalla de Inicio: varias secciones, cada una con su propio pedido.
 *
 * Los pedidos salen juntos y cada sección se queda con su resultado por separado: si falla
 * uno (por ejemplo, seguimientos), el resto de la pantalla se muestra igual y sólo esa
 * tarjeta avisa el error. Por eso `Promise.allSettled` y no `Promise.all`.
 *
 * Se recarga al volver a la pestaña: lo que se hace en otras pantallas (solicitar, quitar un
 * favorito, publicar) tiene que verse en Inicio sin tirar de la lista.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

/** Lo último que se sabe de una sección. `datos` se conserva si un recargo posterior falla. */
export interface SeccionInicio<T> {
  datos: T | null;
  error: boolean;
}

type Cargadores = Record<string, () => Promise<unknown>>;

type Secciones<C extends Cargadores> = {
  [K in keyof C]: SeccionInicio<Awaited<ReturnType<C[K]>>>;
};

function vacias<C extends Cargadores>(cargadores: C): Secciones<C> {
  const resultado = {} as Record<string, SeccionInicio<unknown>>;
  for (const clave of Object.keys(cargadores)) resultado[clave] = { datos: null, error: false };
  return resultado as Secciones<C>;
}

/**
 * `cargadores` tiene que ser estable (una constante de módulo): si cambiara en cada render,
 * la pantalla recargaría sin parar.
 */
export function useDatosInicio<C extends Cargadores>(cargadores: C) {
  const [secciones, setSecciones] = useState<Secciones<C>>(() => vacias(cargadores));
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  /** Sólo aplica la respuesta del último pedido: una recarga lenta no pisa a una más nueva. */
  const ultimoPedido = useRef(0);

  const cargar = useCallback(async (): Promise<void> => {
    const pedido = ++ultimoPedido.current;
    const claves = Object.keys(cargadores);
    const resultados = await Promise.allSettled(claves.map((clave) => cargadores[clave]!()));

    if (pedido !== ultimoPedido.current) return;

    setSecciones((anteriores) => {
      const nuevas = { ...anteriores } as Record<string, SeccionInicio<unknown>>;

      resultados.forEach((resultado, indice) => {
        const clave = claves[indice]!;
        nuevas[clave] =
          resultado.status === 'fulfilled'
            ? { datos: resultado.value, error: false }
            : { datos: nuevas[clave]?.datos ?? null, error: true };
      });

      return nuevas as Secciones<C>;
    });
    setCargando(false);
    setRefrescando(false);
  }, [cargadores]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  const refrescar = useCallback((): void => {
    setRefrescando(true);
    void cargar();
  }, [cargar]);

  return { secciones, cargando, refrescando, refrescar, recargar: cargar };
}
