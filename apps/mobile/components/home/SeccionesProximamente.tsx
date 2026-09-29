/**
 * Secciones de Inicio cuyo módulo todavía no existe: Campañas de donación (Fase 10 del
 * roadmap, Módulo 12) y Mascotas perdidas y encontradas (Fase 11, Módulo 13).
 *
 * Conservan el color y la forma del diseño para que la pantalla no cambie de aspecto el día
 * que lleguen los datos, pero no muestran números ni nombres: no hay de dónde sacarlos y
 * uno inventado se confunde con uno real. Cuando exista cada módulo, esta tarjeta se
 * reemplaza por la que trae los datos.
 *
 * El "Ver mapa" del prototipo no se implementa ni se va a implementar: el proyecto excluye el
 * mapa interactivo (la búsqueda es por Provincia/Localidad).
 */
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { PALETA } from '@/constants/theme';

import { PastillaProximamente } from './PiezasInicio';

/** Póster "SE BUSCA" + texto, en amarillo. */
export function PerdidasAdoptante() {
  return (
    <View
      className="flex-row gap-3 rounded-[28px] p-2"
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
          Vas a poder ver las mascotas perdidas y encontradas de tu localidad y avisar si ves
          una.
        </Text>
        <PastillaProximamente fondo={PALETA.accent[900]} tinta={PALETA.calido.amarilloClaro} />
      </View>
    </View>
  );
}

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

/** Fila amarilla de mascotas perdidas del refugio. */
export function PerdidasRefugio() {
  return (
    <View
      className="flex-row items-center gap-3.5 rounded-[24px] px-4 py-3.5"
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
          Muy pronto: los reportes de tu zona
        </Text>
      </View>
      <Ionicons name="time-outline" size={18} color={PALETA.accent[900]} />
    </View>
  );
}
