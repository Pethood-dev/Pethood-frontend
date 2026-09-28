/**
 * Medalla de una vacuna: pastilla con el ícono de jeringa en el color fijo de esa vacuna
 * (`constants/Vacunas.ts`). Es como se ven las vacunas en toda la app, en vez de texto.
 *
 * Dos usos:
 * - informativa (sin `seleccionada`): siempre en su color. Con `onPress`, se toca para ver
 *   para qué sirve.
 * - en un selector (`seleccionada` true/false): apagada hasta que se elige, así se ve de un
 *   vistazo qué vacunas quedaron marcadas.
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { estiloDeVacuna } from '@/constants/Vacunas';
import { PALETA } from '@/constants/theme';
import type { TipoVacuna } from '@/services/vacunas';

interface MedallaVacunaProps {
  tipo: TipoVacuna;
  nombre: string;
  onPress?: () => void;
  /** Solo en un selector: si la vacuna está elegida. Sin definir, la medalla es informativa. */
  seleccionada?: boolean;
  accessibilityLabel?: string;
  /** Un escalón más grande, al tamaño de los chips de personalidad (ficha de la publicación). */
  grande?: boolean;
}

export function MedallaVacuna({
  tipo,
  nombre,
  onPress,
  seleccionada,
  accessibilityLabel,
  grande = false,
}: MedallaVacunaProps) {
  const estilo = estiloDeVacuna(tipo);
  const apagada = seleccionada === false;

  const fondo = apagada ? PALETA.blanco : estilo.fondo;
  const borde = apagada ? PALETA.neutral[300] : estilo.borde;
  const tinta = apagada ? PALETA.neutral[500] : estilo.tinta;

  const contenido = (
    <>
      <MaterialCommunityIcons name="needle" size={grande ? 18 : 16} color={tinta} />
      <Text
        className={`font-cuerpo-semi ${grande ? 'text-[15px]' : 'text-[13px]'}`}
        style={{ color: tinta }}
        numberOfLines={1}
      >
        {nombre}
      </Text>
      {seleccionada !== undefined ? (
        <Ionicons name={seleccionada ? 'checkmark' : 'add'} size={grande ? 18 : 16} color={tinta} />
      ) : null}
    </>
  );

  const relleno = grande ? 'px-4 py-2' : 'px-3 py-1.5';
  const clases = `flex-row items-center gap-1.5 self-start rounded-full border ${relleno}`;
  const colores = { backgroundColor: fondo, borderColor: borde };

  if (!onPress) {
    return (
      <View className={clases} style={colores} accessibilityLabel={accessibilityLabel ?? nombre}>
        {contenido}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={seleccionada === undefined ? 'button' : 'checkbox'}
      accessibilityState={seleccionada === undefined ? undefined : { checked: seleccionada }}
      accessibilityLabel={accessibilityLabel ?? nombre}
      onPress={onPress}
      hitSlop={4}
      className={`${clases} active:opacity-80`}
      style={colores}
    >
      {contenido}
    </Pressable>
  );
}
