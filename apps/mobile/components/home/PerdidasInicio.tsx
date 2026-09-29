/**
 * Accesos de Inicio al portal de mascotas perdidas y encontradas (GUI-06, HU-13.1): el póster
 * "SE BUSCA" de la vista de adoptante y la fila amarilla de la vista de refugio.
 *
 * Conservan el diseño que tenían mientras el módulo no existía (colores, forma, disposición):
 * sólo dejaron de decir "Muy pronto" y pasaron a llevar al portal.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { PALETA } from '@/constants/theme';

interface AccesoPerdidosProps {
  onPress: () => void;
}

/** Póster "SE BUSCA" + texto, en amarillo. */
export function PerdidasAdoptante({ onPress }: AccesoPerdidosProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mascotas perdidas. Ver reportes"
      onPress={onPress}
      className="flex-row gap-3 rounded-[28px] p-2 active:opacity-90"
      style={{ backgroundColor: PALETA.calido.amarillo }}
    >
      <View
        className="w-[124px] items-center gap-1.5 rounded-[22px] px-[9px] py-2.5"
        style={{ backgroundColor: PALETA.calido.amarilloClaro }}
      >
        <Text
          className="font-titulo text-[16px] tracking-[1.5px]"
          style={{ color: PALETA.accent[800] }}
        >
          SE BUSCA
        </Text>
        <View
          className="h-[92px] w-full items-center justify-center rounded-[13px]"
          style={{ backgroundColor: PALETA.calido.amarillo }}
        >
          <Ionicons name="search" size={34} color={PALETA.accent[800]} />
        </View>
        <Text className="font-cuerpo-bold text-[12px]" style={{ color: PALETA.accent[800] }}>
          ¿Lo viste?
        </Text>
      </View>

      <View className="min-w-0 flex-1 justify-between gap-2.5 py-2 pr-2">
        <View>
          <Text
            className="font-titulo text-[17px] leading-[20px]"
            style={{ color: PALETA.accent[900] }}
          >
            Mascotas perdidas
          </Text>
          <Text
            className="mt-0.5 font-cuerpo-semi text-[12.5px]"
            style={{ color: PALETA.accent[800] }}
          >
            Reportes de tu zona
          </Text>
        </View>
        <Text
          className="font-cuerpo text-[12.5px] leading-[17px]"
          style={{ color: PALETA.accent[900] }}
        >
          Mirá las mascotas perdidas y encontradas y avisá si ves una.
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="font-cuerpo-bold text-[13px]" style={{ color: PALETA.accent[900] }}>
            Ver reportes
          </Text>
          <Ionicons name="arrow-forward" size={15} color={PALETA.accent[900]} />
        </View>
      </View>
    </Pressable>
  );
}

/** Fila amarilla de mascotas perdidas del refugio. */
export function PerdidasRefugio({ onPress }: AccesoPerdidosProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mascotas perdidas. Ver reportes"
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[24px] px-4 py-3.5 active:opacity-90"
      style={{ backgroundColor: PALETA.calido.amarillo }}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: PALETA.calido.amarilloClaro }}
      >
        <Ionicons name="search" size={20} color={PALETA.accent[800]} />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="font-titulo text-[15.5px] leading-[18px]"
          style={{ color: PALETA.accent[900] }}
        >
          Mascotas perdidas
        </Text>
        <Text
          className="mt-0.5 font-cuerpo-semi text-[12.5px]"
          style={{ color: PALETA.accent[800] }}
        >
          Los reportes de tu zona
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={PALETA.accent[900]} />
    </Pressable>
  );
}
