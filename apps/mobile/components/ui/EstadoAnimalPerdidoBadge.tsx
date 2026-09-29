/**
 * Pastilla de estado del aviso de mascota perdida (Perdido, Encontrado, Resuelto). Va encima
 * de la foto, arriba a la izquierda, en la grilla del portal y en el popup de detalle.
 */
import { Text, View } from 'react-native';

import { estiloDeEstadoAnimalPerdido } from '@/constants/EstadosAnimalPerdido';

interface EstadoAnimalPerdidoBadgeProps {
  /** Nombre del catálogo: `Perdido`, `Encontrado`, `Resuelto`. */
  estado: string;
  /** `md` para el popup de detalle, que tiene la foto más grande. */
  tamanio?: 'sm' | 'md';
}

export function EstadoAnimalPerdidoBadge({
  estado,
  tamanio = 'sm',
}: EstadoAnimalPerdidoBadgeProps) {
  const { fondo, texto, etiqueta } = estiloDeEstadoAnimalPerdido(estado);
  const relleno = tamanio === 'md' ? 'px-3 py-1' : 'px-2.5 py-[3px]';
  const letra = tamanio === 'md' ? 'text-[13px]' : 'text-[12px]';

  return (
    <View className={`self-start rounded-full border ${relleno} ${fondo}`}>
      <Text className={`font-cuerpo-bold ${letra} ${texto}`}>{etiqueta}</Text>
    </View>
  );
}
