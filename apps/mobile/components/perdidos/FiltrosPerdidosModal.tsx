/**
 * Filtros del portal de mascotas perdidas (GUI-06, HU-13.1 criterio 7), desplegados desde la
 * pastilla "Filtros". El diseño no trae esta pantalla: sigue la pantalla 33 (Filtros
 * avanzados) con el mismo armado que `FiltrosSolicitudesModal` (decisión del 2026-09-29).
 *
 * Cuatro secciones, todas de selección múltiple menos la fecha:
 * - Estado: Perdido, Encontrado y Resuelto (el portal muestra los tres).
 * - Especie.
 * - Localidad: las ubicaciones que ya tienen los avisos. La ubicación todavía es texto libre
 *   (spec 020 del backend), así que no hay un catálogo del cual sacarlas.
 * - Fecha de publicación: "desde" obligatoria para filtrar por fecha, "hasta" opcional.
 *
 * Se edita sobre un borrador local y recién al tocar "Aplicar" se avisa hacia afuera: así
 * cambiar tres cosas no recarga el portal tres veces. Cerrar sin aplicar descarta el borrador.
 */
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateField } from '@/components/ui/DateField';
import { FormCard, FormCardRow } from '@/components/ui/FormCard';
import { type OpcionSelector } from '@/components/ui/SelectorChips';
import { SelectorChipsMultiples } from '@/components/ui/SelectorChipsMultiples';
import { PALETA } from '@/constants/theme';
import {
  contarFiltrosActivosPerdidos,
  listarUbicaciones,
  SIN_FILTROS_PERDIDOS,
  type FiltrosPerdidos,
} from '@/services/animalesPerdidos';
import { ApiError } from '@/services/api';
import { listarEspecies, listarEstadosAnimalPerdido } from '@/services/catalogos';

/** Mensaje de la API ante "hasta" sin "desde", para que el cliente diga lo mismo antes. */
const FALTA_DESDE = 'Para filtrar por fecha, elegí la fecha "desde"';

/** Las pastillas van en plural, como las de la pantalla 33 ("Perros", "Gatos"). */
function enPlural(nombre: string): string {
  return /[aeiouáéíóú]$/i.test(nombre) ? `${nombre}s` : `${nombre}es`;
}

interface Opciones {
  estados: OpcionSelector<number>[];
  especies: OpcionSelector<number>[];
  ubicaciones: OpcionSelector<string>[];
}

/** Bloque con rótulo en mayúsculas, como las secciones de la pantalla 33. */
function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View className="mb-7">
      <Text className="mb-3 font-cuerpo-bold text-[14px] uppercase tracking-[1px] text-organic-neutral-800">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Ayuda({ texto }: { texto: string }) {
  return (
    <Text className="mt-3 font-cuerpo text-[15px] leading-[21px] text-organic-neutral-600">
      {texto}
    </Text>
  );
}

interface FiltrosPerdidosModalProps {
  visible: boolean;
  /** Filtros aplicados hoy; el borrador se reinicia con ellos cada vez que se abre. */
  filtros: FiltrosPerdidos;
  onAplicar: (filtros: FiltrosPerdidos) => void;
  onCerrar: () => void;
}

export function FiltrosPerdidosModal({
  visible,
  filtros,
  onAplicar,
  onCerrar,
}: FiltrosPerdidosModalProps) {
  const insets = useSafeAreaInsets();
  const [borrador, setBorrador] = useState<FiltrosPerdidos>(filtros);
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [errorOpciones, setErrorOpciones] = useState<string | null>(null);

  /**
   * Las opciones se piden cada vez que se abre: un aviso nuevo puede haber sumado una
   * ubicación que antes no estaba.
   */
  const cargarOpciones = useCallback(async (): Promise<void> => {
    setErrorOpciones(null);

    try {
      const [estados, especies, ubicaciones] = await Promise.all([
        listarEstadosAnimalPerdido(),
        listarEspecies(),
        listarUbicaciones(),
      ]);

      setOpciones({
        estados: estados.map((estado) => ({ valor: estado.id, etiqueta: enPlural(estado.nombre) })),
        especies: especies.map((especie) => ({
          valor: especie.id,
          etiqueta: enPlural(especie.nombre),
        })),
        ubicaciones: ubicaciones.map((ubicacion) => ({ valor: ubicacion, etiqueta: ubicacion })),
      });
    } catch (err) {
      setErrorOpciones(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los filtros. Revisá tu conexión e intentalo de nuevo.',
      );
    }
  }, []);

  // Al abrir se descarta cualquier borrador anterior: lo que se ve tiene que ser lo que
  // está aplicado, no lo que el usuario tocó y no confirmó la vez pasada.
  useEffect(() => {
    if (!visible) return;
    setBorrador(filtros);
    void cargarOpciones();
  }, [visible, filtros, cargarOpciones]);

  const activos = contarFiltrosActivosPerdidos(borrador);
  // La HU pide "desde" obligatoria para filtrar por fecha: un "hasta" suelto no se aplica.
  const errorFecha =
    borrador.fechaHasta !== undefined && borrador.fechaDesde === undefined
      ? FALTA_DESDE
      : undefined;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCerrar} statusBarTranslucent>
      <View className="flex-1 bg-organic-bg">
        {/* Margen superior a mano: dentro de un `Modal` el `SafeAreaView` nativo no recibe los
            insets en iOS (ver `FiltrosSolicitudesModal`). */}
        <View className="flex-1" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between border-b border-organic-neutral-300 bg-organic-neutral-100 px-5 py-[13px]">
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar filtros"
                onPress={onCerrar}
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded-full border border-organic-neutral-300 bg-organic-neutral-100 active:opacity-80"
              >
                <Ionicons name="arrow-back" size={22} color={PALETA.neutral[700]} />
              </Pressable>

              <Text className="font-titulo text-[26px] leading-[31px] text-organic-accent-600">
                Filtros
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
              onPress={() => setBorrador(SIN_FILTROS_PERDIDOS)}
              disabled={activos === 0 && borrador.fechaHasta === undefined}
              hitSlop={12}
              className="py-2 active:opacity-70"
            >
              <Text
                className={`font-cuerpo-semi text-[17px] ${
                  activos === 0 && borrador.fechaHasta === undefined
                    ? 'text-organic-neutral-400'
                    : 'text-organic-accent-700'
                }`}
              >
                Limpiar
              </Text>
            </Pressable>
          </View>

          {opciones === null ? (
            <View className="flex-1 items-center justify-center px-8">
              {errorOpciones ? (
                <>
                  <Text className="text-center font-cuerpo text-[15px] text-organic-neutral-600">
                    {errorOpciones}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void cargarOpciones()}
                    hitSlop={8}
                    className="mt-3 active:opacity-60"
                  >
                    <Text className="font-cuerpo-bold text-[16px] text-organic-accent-600">
                      Reintentar
                    </Text>
                  </Pressable>
                </>
              ) : (
                <ActivityIndicator color={PALETA.accent[600]} />
              )}
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 22 }}>
              <Seccion titulo="Estado">
                <SelectorChipsMultiples
                  prefijo="estado-perdido"
                  etiquetaSinFiltro="Todos"
                  opciones={opciones.estados}
                  valores={borrador.estados}
                  onChange={(estados) => setBorrador({ ...borrador, estados })}
                  variante="filtro"
                  amplio
                />
                <Ayuda texto="Podés elegir más de un estado." />
              </Seccion>

              <Seccion titulo="Especie">
                <SelectorChipsMultiples
                  prefijo="especie-perdido"
                  etiquetaSinFiltro="Todas"
                  opciones={opciones.especies}
                  valores={borrador.especies}
                  onChange={(especies) => setBorrador({ ...borrador, especies })}
                  variante="filtro"
                  amplio
                />
              </Seccion>

              <Seccion titulo="Localidad">
                {opciones.ubicaciones.length > 0 ? (
                  <SelectorChipsMultiples
                    prefijo="localidad-perdido"
                    etiquetaSinFiltro="Todas"
                    opciones={opciones.ubicaciones}
                    valores={borrador.ubicaciones}
                    onChange={(ubicaciones) => setBorrador({ ...borrador, ubicaciones })}
                    variante="filtro"
                    amplio
                  />
                ) : (
                  <Ayuda texto="Todavía no hay avisos con una localidad cargada." />
                )}
              </Seccion>

              <Seccion titulo="Fecha de publicación">
                <FormCard>
                  <FormCardRow>
                    <DateField
                      label="Desde"
                      placeholder="Elegí la fecha"
                      valor={borrador.fechaDesde ?? null}
                      onChange={(fecha) => setBorrador({ ...borrador, fechaDesde: fecha })}
                      fechaMaxima={borrador.fechaHasta ?? new Date()}
                      mostrarEdad={false}
                      error={errorFecha}
                      grande
                    />
                  </FormCardRow>
                  <FormCardRow ultima>
                    <DateField
                      label="Hasta (opcional)"
                      placeholder="Hasta hoy"
                      valor={borrador.fechaHasta ?? null}
                      onChange={(fecha) => setBorrador({ ...borrador, fechaHasta: fecha })}
                      fechaMinima={borrador.fechaDesde}
                      fechaMaxima={new Date()}
                      mostrarEdad={false}
                      grande
                    />
                  </FormCardRow>
                </FormCard>
              </Seccion>
            </ScrollView>
          )}

          {/* Como en la pantalla 33, el botón va sobre el mismo fondo, sin barra propia. */}
          <View className="px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: errorFecha !== undefined }}
              onPress={() => onAplicar(borrador)}
              disabled={errorFecha !== undefined}
              className={`items-center rounded-[20px] bg-organic-accent-600 py-[18px] shadow-md active:opacity-90 ${
                errorFecha ? 'opacity-40' : ''
              }`}
            >
              <Text className="font-cuerpo-semi text-[18px] text-white">
                {activos === 0
                  ? 'Aplicar filtros'
                  : `Aplicar filtros (${activos} activo${activos === 1 ? '' : 's'})`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
