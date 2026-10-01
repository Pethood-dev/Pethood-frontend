/**
 * Popup de detalle de un aviso de mascota perdida o encontrada (pantalla 6b del diseño). Se
 * abre al tocar una tarjeta del portal y se cierra con la cruz, tocando afuera o con el
 * botón atrás de Android.
 *
 * Diferencias con el diseño, por lo que el aviso tiene y no tiene (ver la spec 020):
 * - El subtítulo del diseño es "Perro macho · Golden Retriever · 3 años", pero el aviso sólo
 *   sabe la especie: va "especie · hace cuánto", igual que en la tarjeta.
 * - El diseño muestra un teléfono de contacto que la API no expone. En su lugar va quién
 *   publicó el aviso, que es con quien se va a hablar.
 * - "Enviar mensaje" queda deshabilitado: el chat de reencuentro es de HU-13.2. En un aviso
 *   propio ni se muestra, porque no hay a quién escribirle.
 * - Dos agregados que el diseño no trae, de cuando el lugar pasó al catálogo de provincias: a
 *   qué distancia está el lugar (si el usuario dio su ubicación y el lugar se pudo ubicar en
 *   el mapa) y un botón para verlo en Google Maps.
 *
 * El aviso puede traer hasta 5 fotos: la tarjeta del portal muestra sólo la portada y acá se
 * deslizan todas, con puntos que marcan en cuál se está.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { BotonReportar } from '@/components/reportes/BotonReportar';
import { EstadoAnimalPerdidoBadge } from '@/components/ui/EstadoAnimalPerdidoBadge';
import { PALETA } from '@/constants/theme';
import { distanciaEnTexto } from '@/lib/ubicacion';
import { urlAbsoluta } from '@/services/api';
import type { AvisoPerdido } from '@/services/animalesPerdidos';
import { aFechaVisible, parsearFecha } from '@/shared/validation/dates';

import { subtituloAviso } from './TarjetaAviso';

/**
 * El día del hecho, que el diseño muestra dentro de la descripción ("Se perdió el 19/06…").
 * En un aviso resuelto no se sabe si empezó perdido o encontrado, así que va sin verbo.
 */
function textoSuceso(aviso: AvisoPerdido): string | null {
  const fecha = parsearFecha(aviso.fechaSuceso);
  if (!fecha) return null;

  const dia = aFechaVisible(fecha);
  if (aviso.estado.nombre === 'Perdido') return `Se perdió el ${dia}`;
  if (aviso.estado.nombre === 'Encontrado') return `Se encontró el ${dia}`;
  return `Sucedió el ${dia}`;
}

interface DetalleAvisoModalProps {
  /** El aviso a mostrar, o `null` con el popup cerrado. */
  aviso: AvisoPerdido | null;
  onCerrar: () => void;
}

export function DetalleAvisoModal({ aviso, onCerrar }: DetalleAvisoModalProps) {
  return (
    <Modal
      visible={aviso !== null}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
      statusBarTranslucent
    >
      {/* Fondo y tarjeta son hermanos: un Pressable dentro de otro en web (React 19)
          dispara onPress al renderizar y tira el handler de cerrar. */}
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCerrar}
          className="absolute inset-0"
        />

        {aviso ? <TarjetaDetalle aviso={aviso} onCerrar={onCerrar} /> : null}
      </View>
    </Modal>
  );
}

function TarjetaDetalle({ aviso, onCerrar }: { aviso: AvisoPerdido; onCerrar: () => void }) {
  const fotos = aviso.imagenes
    .map(urlAbsoluta)
    .filter((url): url is string => url !== null);
  const nombre = aviso.nombre ?? 'Sin nombre';
  const reportante = `${aviso.reportante.nombre} ${aviso.reportante.apellido}`.trim();
  const suceso = textoSuceso(aviso);
  // "Godoy Cruz - Mendoza · a 2,3 km", como la zona de la ficha de una publicación.
  const lugar = [
    aviso.ubicacion,
    aviso.distanciaKm !== null ? distanciaEnTexto(aviso.distanciaKm) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const mapaUrl = aviso.mapaUrl;

  return (
    <View
      className="z-10 max-h-[88%] w-full overflow-hidden rounded-[28px] bg-organic-surface"
      accessibilityViewIsModal
    >
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View className="w-full bg-organic-neutral-200" style={{ aspectRatio: 4 / 3 }}>
          {fotos.length > 0 ? (
            <GaleriaFotos fotos={fotos} nombre={nombre} />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="paw-outline" size={48} color={PALETA.neutral[400]} />
            </View>
          )}

          <View className="absolute left-3 top-3">
            <EstadoAnimalPerdidoBadge estado={aviso.estado.nombre} tamanio="md" />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar el aviso"
            onPress={onCerrar}
            hitSlop={10}
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white/90 active:opacity-70"
          >
            <Ionicons name="close" size={20} color={PALETA.neutral[700]} />
          </Pressable>
        </View>

        <View className="px-5 pb-5 pt-4">
          <Text className="font-titulo text-[24px] leading-[28px] text-organic-neutral-900">
            {nombre}
          </Text>
          <Text className="mt-1 font-cuerpo text-[14px] text-organic-neutral-600">
            {subtituloAviso(aviso)}
          </Text>

          <Text className="mt-3.5 font-cuerpo text-[15px] leading-[22px] text-organic-neutral-800">
            {aviso.descripcion}
          </Text>

          <View className="mt-4 gap-2.5">
            {lugar ? <DatoConIcono icono="location-outline" texto={lugar} /> : null}
            {suceso ? <DatoConIcono icono="calendar-outline" texto={suceso} /> : null}
            <DatoConIcono icono="person-outline" texto={`Lo publicó ${reportante}`} />
          </View>

          {mapaUrl ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Ver el lugar en Google Maps"
              onPress={() => void Linking.openURL(mapaUrl).catch(() => undefined)}
              className="mt-5 h-[48px] flex-row items-center justify-center gap-2 rounded-full border border-organic-accent-600 active:opacity-70"
            >
              <Ionicons name="map-outline" size={19} color={PALETA.accent[600]} />
              <Text className="font-cuerpo-bold text-[16px] text-organic-accent-600">
                Ver en Google Maps
              </Text>
            </Pressable>
          ) : null}

          {aviso.esPropio ? null : (
            <View className={mapaUrl ? 'mt-3' : 'mt-5'}>
              {/* Deshabilitado con el mismo gris que las funciones que todavía no están en
                  el Perfil: el chat de reencuentro llega con HU-13.2. */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                accessibilityHint="Todavía no disponible"
                disabled
                className="h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-organic-accent-600 opacity-40"
              >
                <Ionicons name="chatbubble-outline" size={19} color={PALETA.blanco} />
                <Text className="font-cuerpo-bold text-[16px] text-white">Enviar mensaje</Text>
              </Pressable>
              <Text className="mt-2 text-center font-cuerpo text-[12.5px] text-organic-neutral-600">
                Muy pronto vas a poder escribirle desde acá.
              </Text>
            </View>
          )}

          {aviso.esPropio ? null : (
            <BotonReportar
              tipo="ANIMAL_PERDIDO"
              objetoId={aviso.id}
              etiqueta="Reportar aviso"
              className="mt-4"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Las fotos una al lado de la otra, de a una por pantalla. Cada página mide exactamente lo
 * que la caja de la foto, así que se espera a medirla antes de pintarlas.
 */
function GaleriaFotos({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [medidas, setMedidas] = useState<{ ancho: number; alto: number } | null>(null);
  const [actual, setActual] = useState(0);

  return (
    <View
      className="h-full w-full"
      onLayout={(evento) => {
        const { width, height } = evento.nativeEvent.layout;
        setMedidas({ ancho: width, alto: height });
      }}
    >
      {medidas ? (
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          // `onScroll` y no `onMomentumScrollEnd`, que en web no se dispara.
          onScroll={(evento) =>
            setActual(Math.round(evento.nativeEvent.contentOffset.x / medidas.ancho))
          }
        >
          {fotos.map((uri, indice) => (
            <Image
              key={`${uri}-${indice}`}
              source={{ uri }}
              style={{ width: medidas.ancho, height: medidas.alto }}
              resizeMode="cover"
              accessibilityLabel={
                fotos.length > 1
                  ? `Foto ${indice + 1} de ${fotos.length} de ${nombre}`
                  : `Foto de ${nombre}`
              }
            />
          ))}
        </ScrollView>
      ) : null}

      {fotos.length > 1 ? (
        <View pointerEvents="none" className="absolute bottom-3 left-0 right-0 items-center">
          <View className="flex-row items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5">
            {fotos.map((uri, indice) => (
              <View
                key={`${uri}-${indice}`}
                className={`h-2 rounded-full ${indice === actual ? 'w-5 bg-white' : 'w-2 bg-white/60'}`}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DatoConIcono({ icono, texto }: { icono: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icono} size={17} color={PALETA.neutral[600]} />
      <Text className="min-w-0 flex-1 font-cuerpo text-[14px] text-organic-neutral-700">
        {texto}
      </Text>
    </View>
  );
}
