/**
 * Tarjeta grande de Inicio del adoptante: cuántas mascotas hay en el feed, un abanico con
 * las tres primeras y los accesos al swipe y a los filtros.
 *
 * El texto y el abanico van en dos columnas que no se superponen: en el prototipo el título
 * flotaba sobre las fotos y en pantallas angostas quedaba tapado. Acá el abanico tiene un
 * ancho fijo (que se achica un poco en teléfonos chicos) y el título usa lo que sobra.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { PALETA } from '@/constants/theme';
import { etiquetaEdad, etiquetaTamanio } from '@/constants/Mascotas';
import { tituloAdoptar } from '@/lib/inicio';
import { urlAbsoluta } from '@/services/api';
import type { PublicacionFeed } from '@/services/publicaciones';

import { AvisoSeccionFallida, BotonAmarillo, SOMBRA_FOTO } from './PiezasInicio';

/** Medidas del abanico en un teléfono de 390 de ancho; en uno más chico se escalan. */
const ABANICO = { ancho: 150, alto: 186 };
/** Ancho útil de la tarjeta en el teléfono de referencia (390 − márgenes − padding). */
const ANCHO_REFERENCIA = 302;

/**
 * Las tres fotos, de atrás hacia adelante: posición desde la esquina superior derecha del
 * abanico, tamaño, giro y color del marco. La de adelante lleva el nombre.
 */
const FOTOS = [
  { derecha: 0, arriba: 6, ancho: 100, alto: 136, giro: '12deg', marco: PALETA.accent[700] },
  { derecha: 16, arriba: 10, ancho: 100, alto: 136, giro: '2deg', marco: PALETA.accent[600] },
  { derecha: 34, arriba: 22, ancho: 108, alto: 146, giro: '-8deg', marco: PALETA.surface },
] as const;

interface TarjetaAdoptarProps {
  /** `null` mientras carga o si falló sin datos previos. */
  feed: { total: number; publicaciones: PublicacionFeed[] } | null;
  error: boolean;
  onSwipear: () => void;
  onFiltros: () => void;
}

export function TarjetaAdoptar({ feed, error, onSwipear, onFiltros }: TarjetaAdoptarProps) {
  const { width } = useWindowDimensions();
  const escala = Math.min(1, Math.max(0.78, (width - 88) / ANCHO_REFERENCIA));

  return (
    <View className="rounded-[30px] p-[22px]" style={{ backgroundColor: PALETA.accent[800] }}>
      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1">
          <Text
            className="font-cuerpo-bold text-[11px] tracking-[1.4px]"
            style={{ color: PALETA.accent[400] }}
          >
            ADOPTAR
          </Text>
          {/* En teléfonos angostos el título se achica junto con el abanico, así el número no
              queda solo en un renglón. `adjustsFontSizeToFit` es la red para nativo. */}
          <Text
            className="mt-2 font-titulo"
            style={{
              color: PALETA.accent[100],
              fontSize: Math.round(26 * escala),
              lineHeight: Math.round(29 * escala),
            }}
            numberOfLines={4}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {feed ? tituloAdoptar(feed.total) : 'Peludos que buscan familia'}
          </Text>
          <Text
            className="mt-2 font-cuerpo text-[13px] leading-[18px]"
            style={{ color: PALETA.accent[300] }}
          >
            Deslizá para conocerlos
          </Text>
          {error && !feed ? (
            <AvisoSeccionFallida
              texto="No pudimos traer las mascotas."
              color={PALETA.accent[300]}
            />
          ) : null}
        </View>

        <Abanico publicaciones={feed?.publicaciones ?? []} escala={escala} />
      </View>

      <View className="mt-5 flex-row items-center gap-2.5">
        <BotonAmarillo texto="Empezar a swipear" iconoInicio="paw" onPress={onSwipear} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtros de búsqueda"
          onPress={onFiltros}
          className="h-[50px] w-[50px] items-center justify-center rounded-full active:opacity-80"
          style={{
            backgroundColor: PALETA.accent[800],
            borderWidth: 1.5,
            borderColor: PALETA.accent[700],
          }}
        >
          <Ionicons name="options-outline" size={20} color={PALETA.accent[300]} />
        </Pressable>
      </View>
    </View>
  );
}

function Abanico({ publicaciones, escala }: { publicaciones: PublicacionFeed[]; escala: number }) {
  // Las primeras del feed van adelante: la de adelante es la última que se dibuja.
  const visibles = publicaciones.slice(0, FOTOS.length).reverse();
  const posiciones = FOTOS.slice(FOTOS.length - Math.max(visibles.length, 1));

  return (
    <View
      style={{ width: ABANICO.ancho * escala, height: ABANICO.alto * escala }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {posiciones.map((posicion, indice) => {
        const publicacion = visibles[indice];
        const esLaDeAdelante = indice === posiciones.length - 1;
        const foto = publicacion
          ? urlAbsoluta(publicacion.imagenes[0] ?? publicacion.mascota.imagenUrl)
          : null;

        return (
          <View
            key={posicion.giro}
            className="absolute overflow-hidden"
            style={{
              right: posicion.derecha * escala,
              top: posicion.arriba * escala,
              width: posicion.ancho * escala,
              height: posicion.alto * escala,
              borderRadius: 18 * escala,
              borderWidth: 4,
              borderColor: posicion.marco,
              backgroundColor: PALETA.accent[300],
              transform: [{ rotate: posicion.giro }],
              ...(esLaDeAdelante ? SOMBRA_FOTO : {}),
            }}
          >
            {foto ? (
              <Image source={{ uri: foto }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="paw" size={32 * escala} color={PALETA.accent[600]} />
              </View>
            )}

            {esLaDeAdelante && publicacion ? (
              <View
                className="absolute bottom-0 left-0 right-0 px-[9px] py-1.5"
                style={{ backgroundColor: PALETA.accent[900] }}
              >
                <Text
                  numberOfLines={1}
                  className="font-titulo text-[14px] leading-[16px]"
                  style={{ color: PALETA.accent[100] }}
                >
                  {publicacion.mascota.nombre ?? 'Sin nombre'}
                </Text>
                <Text
                  numberOfLines={1}
                  className="font-cuerpo text-[10.5px]"
                  style={{ color: PALETA.accent[300] }}
                >
                  {resumenCorto(publicacion)}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

/** "2 años · Mediano": el sexo no entra en el pie de una foto tan chica. */
function resumenCorto({ mascota }: PublicacionFeed): string {
  return [etiquetaEdad(mascota.fechaNacimiento), etiquetaTamanio(mascota.tamanio)]
    .filter(Boolean)
    .join(' · ');
}
