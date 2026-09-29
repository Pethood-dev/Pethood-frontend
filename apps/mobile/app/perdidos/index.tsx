/**
 * GUI-06 Mascotas Perdidas — HU-13.1: el portal de avisos de mascotas perdidas y encontradas.
 *
 * Grilla de dos columnas (pantalla 06 del diseño), del aviso más reciente al más viejo y con
 * avisos en cualquier estado, Resuelto incluido. Tocar una tarjeta abre el popup de detalle
 * (pantalla 6b). Pagina por cursor con scroll infinito (`usePaginacionCursor`).
 *
 * Cualquier usuario autenticado lo ve igual, desde cualquiera de sus dos perfiles: el aviso es
 * siempre de la persona (spec 020 del backend).
 *
 * Es una ruta del stack y no una tab, como Favoritos: se entra desde las dos vistas de Inicio y
 * el botón de retroceso tiene que volver al origen real.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoCargando, EstadoError, EstadoVacio } from '@/components/feedback/EstadosPantalla';
import { DetalleAvisoModal } from '@/components/perdidos/DetalleAvisoModal';
import { TarjetaAviso } from '@/components/perdidos/TarjetaAviso';
import { BotonCircular } from '@/components/ui/BotonCircular';
import { BotonFlotante } from '@/components/ui/BotonFlotante';
import { PALETA } from '@/constants/theme';
import { usePaginacionCursor } from '@/hooks/usePaginacionCursor';
import { tomarAvisoCreado } from '@/lib/avisoRecienCreado';
import { listarAvisos, SIN_FILTROS_PERDIDOS, type AvisoPerdido } from '@/services/animalesPerdidos';

const SIN_CONEXION =
  'No pudimos cargar las publicaciones. Revisá tu conexión e intentalo de nuevo.';

const claveDeAviso = (aviso: AvisoPerdido): number => aviso.id;

/**
 * Hueco que completa una fila impar, igual que en Favoritos: con `numColumns={2}` el único
 * ítem de la última fila ocuparía todo el ancho.
 */
const RELLENO = '__relleno__' as const;
type ItemGrilla = AvisoPerdido | typeof RELLENO;

function conRellenoDeFila(avisos: AvisoPerdido[]): ItemGrilla[] {
  return avisos.length % 2 === 1 ? [...avisos, RELLENO] : avisos;
}

/** Texto literal de HU-13.1, criterio 2. */
function ListaVacia() {
  return (
    <EstadoVacio
      icono="search-outline"
      titulo="No hay publicaciones de mascotas perdidas/encontradas"
      descripcion="Cuando alguien reporte una mascota perdida o encontrada, la vas a ver acá."
    />
  );
}

interface PieListaProps {
  cargandoMas: boolean;
  errorMas: string | null;
  onReintentar: () => void;
}

/** Lo que va debajo de la grilla mientras se trae otra página, o si esa página falló. */
function PieLista({ cargandoMas, errorMas, onReintentar }: PieListaProps) {
  if (cargandoMas) {
    return (
      <View className="items-center py-5">
        <ActivityIndicator color={PALETA.accent[600]} />
      </View>
    );
  }

  if (errorMas) {
    return (
      <View className="items-center gap-2 px-6 py-5">
        <Text className="text-center font-cuerpo text-[14px] text-organic-neutral-600">
          {errorMas}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onReintentar}
          hitSlop={8}
          className="active:opacity-60"
        >
          <Text className="font-cuerpo-bold text-[15px] text-organic-accent-600">Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

export default function MascotasPerdidasScreen() {
  const router = useRouter();
  const [seleccionado, setSeleccionado] = useState<AvisoPerdido | null>(null);

  const cargarPagina = useCallback(async (cursor: number | null) => {
    const pagina = await listarAvisos(SIN_FILTROS_PERDIDOS, cursor);
    return { items: pagina.avisos, hayMas: pagina.hayMas, proximoCursor: pagina.proximoCursor };
  }, []);

  const lista = usePaginacionCursor({
    cargarPagina,
    claveDe: claveDeAviso,
    mensajeSinConexion: SIN_CONEXION,
  });

  // Al volver del alta (GUI-25), el aviso recién publicado va arriba sin recargar la grilla.
  const { agregarAlPrincipio } = lista;
  useFocusEffect(
    useCallback(() => {
      const creado = tomarAvisoCreado();
      if (creado) agregarAlPrincipio(creado);
    }, [agregarAlPrincipio]),
  );

  // Se entra desde las dos vistas de Inicio: `back()` vuelve al origen real. El fallback
  // cubre el caso sin historial (deep link directo).
  const volver = useCallback((): void => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  return (
    <View className="flex-1 bg-organic-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center gap-3 border-b border-organic-neutral-300 bg-organic-surface px-[22px] pb-4 pt-2">
          <BotonCircular icono="arrow-back" etiqueta="Volver" onPress={volver} grande />
          <Text className="font-titulo text-[28px] leading-[32px] text-organic-accent-600">
            Mascotas Perdidas
          </Text>
        </View>

        {lista.cargando ? (
          <EstadoCargando />
        ) : lista.error ? (
          <EstadoError mensaje={lista.error} onAccion={lista.recargar} />
        ) : (
          <FlatList
            data={conRellenoDeFila(lista.items)}
            keyExtractor={(item, indice) =>
              item === RELLENO ? `relleno-${indice}` : String(item.id)
            }
            numColumns={2}
            renderItem={({ item }) =>
              item === RELLENO ? (
                <View className="flex-1" />
              ) : (
                <TarjetaAviso aviso={item} onPress={() => setSeleccionado(item)} />
              )
            }
            ListEmptyComponent={ListaVacia}
            ListFooterComponent={
              <PieLista
                cargandoMas={lista.cargandoMas}
                errorMas={lista.errorMas}
                onReintentar={lista.reintentarMas}
              />
            }
            onEndReached={lista.cargarMas}
            onEndReachedThreshold={0.5}
            columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
            // Abajo deja lugar para el botón flotante, así la última fila no queda tapada.
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 112,
            }}
            refreshControl={
              <RefreshControl
                refreshing={lista.refrescando}
                onRefresh={lista.refrescar}
                tintColor={PALETA.accent[600]}
              />
            }
          />
        )}

        {/* Naranja, como el de "Mis mascotas": la HU lo pedía amarillo. */}
        <BotonFlotante
          accessibilityLabel="Reportar una mascota perdida o encontrada"
          onPress={() => router.push('/perdidos/nuevo')}
        />
      </SafeAreaView>

      <DetalleAvisoModal aviso={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </View>
  );
}
