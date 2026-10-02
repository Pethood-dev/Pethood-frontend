/** Pastilla de estado de mascota, con el color que le corresponde a cada estado. */
import { Text, View } from 'react-native';
import { estiloDeEstado } from '../../constants/EstadosMascota';

interface EstadoMascotaBadgeProps {
  estado: string;
  /**
   * `md` es más grande (letra y relleno); pantallas más densas como Favoritos la usan. `lg`
   * acompaña al nombre grande de la ficha de la publicación.
   */
  tamanio?: 'sm' | 'md' | 'lg';
}

const RELLENOS = { sm: 'px-2.5 py-1', md: 'px-3 py-1.5', lg: 'px-3.5 py-1.5' };
const LETRAS = { sm: 'text-xs', md: 'text-sm', lg: 'text-[15px]' };

export function EstadoMascotaBadge({ estado, tamanio = 'sm' }: EstadoMascotaBadgeProps) {
  const { fondo, texto, etiqueta } = estiloDeEstado(estado);
  const relleno = RELLENOS[tamanio];
  const letra = LETRAS[tamanio];

  return (
    <View className={`self-start rounded-full border ${relleno} ${fondo}`}>
      <Text className={`${letra} font-medium ${texto}`}>{etiqueta}</Text>
    </View>
  );
}
