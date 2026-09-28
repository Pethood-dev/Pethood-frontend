/**
 * Para qué sirve una vacuna: se abre al tocar una medalla o el ícono de información del
 * selector. Muestra la descripción larga del plan de vacunación y, si ya está aplicada, la
 * fecha. Mismo armado que `ConfirmDialog` en su modo informativo, pero con el color de la
 * vacuna en vez del de un tono.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import { estiloDeVacuna } from '@/constants/Vacunas';
import type { VacunaCatalogo } from '@/services/vacunas';
import { aFechaVisible, parsearFecha } from '@/shared/validation/dates';

interface DetalleVacunaProps {
  /** Null cierra el detalle. */
  vacuna: (VacunaCatalogo & { fechaAplicacion?: string }) | null;
  onCerrar: () => void;
}

export function DetalleVacuna({ vacuna, onCerrar }: DetalleVacunaProps) {
  const estilo = vacuna ? estiloDeVacuna(vacuna.tipo) : null;
  const fecha = vacuna?.fechaAplicacion ? parsearFecha(vacuna.fechaAplicacion) : null;

  return (
    <Modal visible={vacuna !== null} transparent animationType="fade" onRequestClose={onCerrar}>
      {/* Fondo y tarjeta hermanos, como en ConfirmDialog: un Pressable dentro de otro en web
          dispara onPress al renderizar. */}
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCerrar}
          className="absolute inset-0"
        />

        {vacuna && estilo ? (
          <View className="z-10 w-full rounded-3xl bg-white p-6" accessibilityViewIsModal>
            <View
              className="mb-4 h-14 w-14 items-center justify-center self-center rounded-full border"
              style={{ backgroundColor: estilo.fondo, borderColor: estilo.borde }}
            >
              <MaterialCommunityIcons name="needle" size={28} color={estilo.tinta} />
            </View>

            <Text className="text-center font-titulo text-xl text-organic-neutral-900">
              {vacuna.nombre}
            </Text>

            {fecha ? (
              <Text
                className="mt-1 text-center font-cuerpo-semi text-sm"
                style={{ color: estilo.tinta }}
              >
                Aplicada el {aFechaVisible(fecha)}
              </Text>
            ) : null}

            <Text className="mt-3 text-center font-cuerpo text-base leading-6 text-organic-neutral-700">
              {vacuna.descripcion}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={onCerrar}
              className="mt-6 items-center justify-center rounded-2xl bg-organic-accent-600 py-3.5 active:opacity-90"
            >
              <Text className="font-cuerpo-semi text-base text-white">Entendido</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
