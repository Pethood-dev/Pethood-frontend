/**
 * GUI-06 Mascotas Perdidas — HU-13.1: el portal de avisos de mascotas perdidas y encontradas.
 *
 * Grilla de dos columnas (pantalla 06 del diseño), del aviso más reciente al más viejo y con
 * avisos en cualquier estado, Resuelto incluido. Tocar una tarjeta abre el popup de detalle
 * (pantalla 6b). Pagina por cursor con scroll infinito (`usePaginacionCursor`), y cambiar los
 * filtros (criterio 7) vuelve a arrancar desde la primera página, como pide el contrato.
 *
 * La pastilla "Filtros" va en la fila que el diseño deja vacía bajo el título, arriba a la
 * izquierda como pide la HU.
 *
 * Con la ubicación del teléfono, cada aviso trae a qué distancia está su lugar (se ve en el
 * detalle) y se puede filtrar por cercanía. Se pide al entrar, sin frenar el portal: si llega
 * después de la primera página, la grilla se refresca. Sin permiso, el portal anda igual.
 *
 * Cualquier usuario autenticado lo ve igual, desde cualquiera de sus dos perfiles: el aviso es
 * siempre de la persona (spec 020 del backend).
 *
 * Es una ruta del stack y no una tab, como Favoritos: se entra desde las dos vistas de Inicio y
 * el botón de retroceso tiene que volver al origen real.
 */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/CustomButton';
import { EstadoCargando, EstadoError, EstadoVacio } from '@/components/feedback/EstadosPantalla';
import { DetalleAvisoModal } from '@/components/perdidos/DetalleAvisoModal';
import { FiltrosPerdidosModal } from '@/components/perdidos/FiltrosPerdidosModal';
import { TarjetaAviso } from '@/components/perdidos/TarjetaAviso';
import { BotonCircular } from '@/components/ui/BotonCircular';
import { BotonFlotante } from '@/components/ui/BotonFlotante';
import { PALETA } from '@/constants/theme';
import { usePaginacionCursor } from '@/hooks/usePaginacionCursor';
import { tomarAvisoCreado } from '@/lib/avisoRecienCreado';
import { coordenadasRecordadas, pedirUbicacion, type Coordenadas } from '@/lib/ubicacion';
import {
  contarFiltrosActivosPerdidos,
  listarAvisos,
  SIN_FILTROS_PERDIDOS,
  type AvisoPerdido,
  type FiltrosPerdidos,
} from '@/services/animalesPerdidos';

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

interface ListaVaciaProps {
  conFiltros: boolean;
  onModificarFiltros: () => void;
}

/**
 * Sin filtros, el portal vacío dice el texto literal de HU-13.1 (criterio 2). Con filtros, que
 * no haya resultados no significa que no haya avisos: se ofrece cambiarlos, como en Adoptar.
 */
function ListaVacia({ conFiltros, onModificarFiltros }: ListaVaciaProps) {
  if (conFiltros) {
    return (
      <EstadoVacio
        icono="options-outline"
        titulo="No hay avisos con esos filtros"
        descripcion="Probá con otros filtros, o sacalos para ver todas las publicaciones."
      >
        <CustomButton title="Modificar filtros" variant="acento" onPress={onModificarFiltros} />
      </EstadoVacio>
    );
  }

  return (
    <EstadoVacio
      icono="search-outline"
      titulo="No hay publicaciones de mascotas perdidas/encontradas"
      descripcion="Cuando alguien reporte una mascota perdida o encontrada, la vas a ver acá."
    />
  );
}

interface PastillaFiltrosProps {
  activos: number;
  onPress: () => void;
}

/**
 * "Filtros" arriba a la izquierda (HU-13.1). Con los colores del chip `filtro` de la pantalla
 * 33: crema sin filtros, rellena en acento y con la cantidad cuando hay alguno aplicado.
 */
function PastillaFiltros({ activos, onPress }: PastillaFiltrosProps) {
  const conFiltros = activos > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        conFiltros ? `Filtros, ${activos} aplicado${activos === 1 ? '' : 's'}` : 'Filtros'
      }
      onPress={onPress}
      className={`min-h-[44px] flex-row items-center gap-2 self-start rounded-full border px-4 py-2 active:opacity-80 ${
        conFiltros
          ? 'border-organic-accent-600 bg-organic-accent-600'
          : 'border-organic-neutral-300 bg-organic-neutral-100'
      }`}
    >
      <Ionicons
        name="options-outline"
        size={18}
        color={conFiltros ? PALETA.blanco : PALETA.neutral[700]}
      />
      <Text
        className={`text-[16px] ${
          conFiltros ? 'font-cuerpo-bold text-white' : 'font-cuerpo-semi text-organic-neutral-700'
        }`}
      >
        {conFiltros ? `Filtros (${activos})` : 'Filtros'}
      </Text>
    </Pressable>
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
  const [filtros, setFiltros] = useState<FiltrosPerdidos>(SIN_FILTROS_PERDIDOS);
  const [modalFiltros, setModalFiltros] = useState(false);

  const filtrosActivos = contarFiltrosActivosPerdidos(filtros);

  /** Desde dónde se mide la distancia en el listado actual. Ver `cargarPagina`. */
  const coordenadasDelListado = useRef<Coordenadas | null>(null);

  // Depende de los filtros: cada cambio es una función nueva, y el hook vuelve a arrancar
  // desde la primera página sin cursor. La ubicación es la última que tomó la app, en esta
  // pantalla o en cualquier otra, y se fija en la primera página: si cambiara a mitad del
  // scroll, el radio recortaría distinto de una página a la otra.
  const cargarPagina = useCallback(
    async (cursor: number | null) => {
      if (cursor === null) coordenadasDelListado.current = coordenadasRecordadas();
      const pagina = await listarAvisos(filtros, cursor, coordenadasDelListado.current);
      return { items: pagina.avisos, hayMas: pagina.hayMas, proximoCursor: pagina.proximoCursor };
    },
    [filtros],
  );

  const lista = usePaginacionCursor({
    cargarPagina,
    claveDe: claveDeAviso,
    mensajeSinConexion: SIN_CONEXION,
  });

  // Al volver del alta (GUI-25), el aviso recién publicado va arriba sin recargar la grilla.
  // Con filtros aplicados puede no cumplirlos: ahí se recarga y aparece sólo si corresponde.
  const { agregarAlPrincipio, refrescar } = lista;

  /** La ubicación llegó con la grilla ya cargada: hay que volver a pedirla con distancias. */
  const [ubicacionNueva, setUbicacionNueva] = useState(false);

  useEffect(() => {
    if (coordenadasRecordadas()) return;

    let montado = true;
    void pedirUbicacion().then((resultado) => {
      if (montado && resultado.ok) setUbicacionNueva(true);
    });
    return () => {
      montado = false;
    };
  }, []);

  // En un efecto aparte y no en el `then`: ahí `refrescar` sería el de los filtros de cuando
  // se pidió, y si el usuario ya los cambió se traería la grilla vieja.
  useEffect(() => {
    if (!ubicacionNueva) return;
    setUbicacionNueva(false);
    refrescar();
  }, [ubicacionNueva, refrescar]);

  useFocusEffect(
    useCallback(() => {
      const creado = tomarAvisoCreado();
      if (!creado) return;

      if (filtrosActivos > 0) refrescar();
      else agregarAlPrincipio(creado);
    }, [agregarAlPrincipio, refrescar, filtrosActivos]),
  );

  // Siempre un objeto nuevo, así "Aplicar" recarga aunque no haya cambiado nada: puede que sólo
  // se haya actualizado la ubicación desde donde se mide el radio.
  const aplicarFiltros = useCallback((nuevos: FiltrosPerdidos): void => {
    setModalFiltros(false);
    setFiltros({ ...nuevos });
  }, []);

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
        <View className="gap-3 border-b border-organic-neutral-300 bg-organic-surface px-[22px] pb-4 pt-2">
          <View className="flex-row items-center gap-3">
            <BotonCircular icono="arrow-back" etiqueta="Volver" onPress={volver} grande />
            <Text className="font-titulo text-[28px] leading-[32px] text-organic-accent-600">
              Mascotas Perdidas
            </Text>
          </View>

          <PastillaFiltros activos={filtrosActivos} onPress={() => setModalFiltros(true)} />
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
            ListEmptyComponent={
              <ListaVacia
                conFiltros={filtrosActivos > 0}
                onModificarFiltros={() => setModalFiltros(true)}
              />
            }
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

      <FiltrosPerdidosModal
        visible={modalFiltros}
        filtros={filtros}
        onAplicar={aplicarFiltros}
        onCerrar={() => setModalFiltros(false)}
      />
    </View>
  );
}
