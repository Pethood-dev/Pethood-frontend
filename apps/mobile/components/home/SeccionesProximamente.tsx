/**
 * Secciones de Inicio cuyo módulo todavía no existe: Campañas de donación (Fase 10 del
 * roadmap, Módulo 12). Mascotas perdidas ya tiene módulo y sus accesos viven en
 * `PerdidasInicio.tsx`.
 *
 * Conservan el color y la forma del diseño para que la pantalla no cambie de aspecto el día
 * que lleguen los datos, pero no muestran números ni nombres: no hay de dónde sacarlos y
 * uno inventado se confunde con uno real. Cuando exista cada módulo, esta tarjeta se
 * reemplaza por la que trae los datos.
 */
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { PALETA } from '@/constants/theme';

import { PastillaProximamente } from './PiezasInicio';

/** Bloque naranja de campañas del adoptante. */
export function CampaniasAdoptante() {
  return (
    <View className="rounded-[30px] p-[18px]" style={{ backgroundColor: PALETA.accent[600] }}>
      <Text
        className="font-cuerpo-bold text-[11px] tracking-[1.4px]"
        style={{ color: PALETA.accent[200] }}
      >
        CAMPAÑAS · TU AYUDA CUENTA
      </Text>

      <View className="mt-3.5 flex-row items-center gap-3.5">
        <View
          className="h-[84px] w-[84px] items-center justify-center rounded-[20px]"
          style={{
            backgroundColor: PALETA.accent[700],
            borderWidth: 3,
            borderColor: PALETA.accent[400],
          }}
        >
          <Ionicons name="gift-outline" size={34} color={PALETA.accent[200]} />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="font-titulo text-[18px] leading-[21px]"
            style={{ color: PALETA.accent[100] }}
          >
            Ayudá a los refugios
          </Text>
          <Text
            className="mt-1 font-cuerpo text-[12px] leading-[16px]"
            style={{ color: PALETA.accent[200] }}
          >
            Vas a poder donar a sus campañas y ver cuánto les falta para llegar a la meta.
          </Text>
        </View>
      </View>

      <View className="mt-3.5">
        <PastillaProximamente fondo={PALETA.accent[700]} tinta={PALETA.accent[100]} />
      </View>
    </View>
  );
}

/** Tarjeta chica "Mis campañas" del refugio, al lado de Seguimientos. */
export function CampaniasRefugio({ altoMinimo }: { altoMinimo: number }) {
  return (
    <View
      className="flex-1 justify-between gap-3 rounded-[26px] p-3.5"
      style={{ minHeight: altoMinimo, backgroundColor: PALETA.accent[600] }}
    >
      <View
        className="h-[62px] w-[62px] items-center justify-center rounded-full"
        style={{ borderWidth: 7, borderColor: PALETA.accent[700] }}
      >
        <Ionicons name="cash-outline" size={22} color={PALETA.accent[100]} />
      </View>
      <View>
        <Text
          className="font-titulo text-[15.5px] leading-[18px]"
          style={{ color: PALETA.accent[100] }}
        >
          Mis campañas
        </Text>
        <Text
          className="mb-2 mt-[3px] font-cuerpo text-[12px] leading-[16px]"
          style={{ color: PALETA.accent[200] }}
        >
          Vas a poder pedir donaciones.
        </Text>
        <PastillaProximamente fondo={PALETA.accent[700]} tinta={PALETA.accent[100]} />
      </View>
    </View>
  );
}
