/**
 * GUI-25 Nueva publicación perdida/encontrada — HU-13.1: el alta de un aviso.
 *
 * Sigue la pantalla 26 del diseño ("Reportar mascota"): selector Perdida / Encontrada, fotos
 * (hasta 5, la primera es la portada), y en la tarjeta nombre, descripción, lugar y fecha, con un único botón "Publicar reporte".
 * La flecha de atrás hace de "Cancelar" (criterio 6). Dos agregados sobre el diseño, porque el
 * backend los exige: la especie (también la usa el filtro del portal) y el permiso de
 * ubicación, cuyas coordenadas se toman al publicar (precondición de la HU).
 *
 * La validación de acá es sólo para UX: la real la hace el backend y sus mensajes se muestran
 * tal cual. Mismo patrón que el alta de mascota: el botón se habilita con todo válido, y
 * tocarlo deshabilitado marca en rojo lo que falta y lo nombra en un aviso (criterio 5).
 */
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/CustomButton';
import { EstadoCargando, EstadoError } from '@/components/feedback/EstadosPantalla';
import { useToast } from '@/components/feedback/Toast';
import { BotonCircular } from '@/components/ui/BotonCircular';
import { DateField } from '@/components/ui/DateField';
import { FormCard, FormCardRow } from '@/components/ui/FormCard';
import { FormularioConTeclado } from '@/components/ui/FormularioConTeclado';
import { Nota } from '@/components/ui/Nota';
import { PhotosPickerField, type FotoElegida } from '@/components/ui/PhotosPickerField';
import { Segmentado, type OpcionSegmento } from '@/components/ui/Segmentado';
import { SelectField } from '@/components/ui/SelectField';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import { useUbicacionDispositivo } from '@/hooks/useUbicacionDispositivo';
import { avisarAvisoCreado } from '@/lib/avisoRecienCreado';
import { ApiError } from '@/services/api';
import { crearAviso } from '@/services/animalesPerdidos';
import {
  listarEspecies,
  listarEstadosAnimalPerdido,
  type OpcionCatalogo,
} from '@/services/catalogos';
import { validarFechaPasada } from '@/shared/validation/dates';
import { LIMITES } from '@/shared/validation/limits';
import { validarTexto } from '@/shared/validation/text';

/** El estado que exige nombre, como regla del backend: en uno encontrado puede faltar. */
const ESTADO_CON_NOMBRE = 'Perdido';

/**
 * Las opciones del diseño van en femenino ("Perdida / Encontrada", de "la mascota"); el
 * catálogo del backend, en masculino. Un estado sin traducción se muestra tal cual.
 */
const ETIQUETA_EN_ALTA: Record<string, string> = {
  Perdido: 'Perdida',
  Encontrado: 'Encontrada',
};

const { animalPerdido } = LIMITES;

interface ErroresFormulario {
  foto?: string;
  nombre?: string;
  especieId?: string;
  descripcion?: string;
  ubicacion?: string;
  fechaSuceso?: string;
}

/** Nombre visible de cada campo, para decir qué falta al tocar el botón deshabilitado. */
const ETIQUETAS: Record<keyof ErroresFormulario, string> = {
  foto: 'la foto',
  nombre: 'el nombre',
  especieId: 'la especie',
  descripcion: 'la descripción',
  ubicacion: 'el lugar',
  fechaSuceso: 'la fecha',
};

function enumerar(elementos: string[]): string {
  if (elementos.length === 1) return elementos[0]!;
  return `${elementos.slice(0, -1).join(', ')} y ${elementos[elementos.length - 1]}`;
}

export default function NuevoAvisoPerdidoScreen() {
  const router = useRouter();
  const toast = useToast();
  const ubicacion = useUbicacionDispositivo();

  const [estados, setEstados] = useState<OpcionCatalogo[]>([]);
  const [especies, setEspecies] = useState<OpcionCatalogo[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  const [estadoId, setEstadoId] = useState<number | null>(null);
  const [fotos, setFotos] = useState<FotoElegida[]>([]);
  const [nombre, setNombre] = useState('');
  const [especieId, setEspecieId] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  // Casi siempre se reporta en el día: arranca en hoy y se cambia si hace falta.
  const [fechaSuceso, setFechaSuceso] = useState<Date | null>(() => new Date());

  const [guardando, setGuardando] = useState(false);
  /** Revela todos los errores de golpe al intentar publicar. */
  const [mostrarErrores, setMostrarErrores] = useState(false);
  /** Campos de los que el usuario ya salió: sus errores se ven sin haber publicado. */
  const [tocados, setTocados] = useState<Partial<Record<keyof ErroresFormulario, boolean>>>({});

  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const cargar = async (): Promise<void> => {
      setCargandoCatalogos(true);
      setErrorCatalogos(null);

      try {
        const [estadosCargados, especiesCargadas] = await Promise.all([
          listarEstadosAnimalPerdido(),
          listarEspecies(),
        ]);

        // Sólo los que el backend acepta en un alta: Resuelto nunca es un punto de partida.
        const enAlta = estadosCargados.filter((estado) => estado.seleccionableEnAlta);
        setEstados(enAlta);
        setEspecies(especiesCargadas);
        // El diseño arranca con "Perdida" elegida.
        setEstadoId(
          (actual) =>
            actual ??
            enAlta.find((estado) => estado.nombre === ESTADO_CON_NOMBRE)?.id ??
            enAlta[0]?.id ??
            null,
        );
      } catch (err) {
        setErrorCatalogos(
          err instanceof ApiError
            ? err.message
            : 'No pudimos cargar el formulario. Revisá tu conexión e intentalo de nuevo.',
        );
      } finally {
        setCargandoCatalogos(false);
      }
    };

    void cargar();
  }, [intento]);

  const nombreEstado = estados.find((estado) => estado.id === estadoId)?.nombre ?? null;
  const nombreObligatorio = nombreEstado === ESTADO_CON_NOMBRE;

  const opcionesEstado: OpcionSegmento<number>[] = estados.map((estado) => ({
    valor: estado.id,
    etiqueta: ETIQUETA_EN_ALTA[estado.nombre] ?? estado.nombre,
  }));

  const errores = useMemo<ErroresFormulario>(() => {
    const resultado: ErroresFormulario = {};

    if (fotos.length === 0) resultado.foto = 'Agregá una foto del animal';

    const errorNombre = validarTexto(nombre, {
      max: animalPerdido.nombre.max,
      etiqueta: 'El nombre',
      obligatorio: nombreObligatorio,
    });
    if (errorNombre) resultado.nombre = errorNombre;

    if (especieId === null) resultado.especieId = 'La especie es obligatoria';

    const errorDescripcion = validarTexto(descripcion, {
      max: animalPerdido.descripcion.max,
      etiqueta: 'La descripción',
    });
    if (errorDescripcion) resultado.descripcion = errorDescripcion;

    const errorLugar = validarTexto(lugar, {
      max: animalPerdido.ubicacion.max,
      etiqueta: 'El lugar',
    });
    if (errorLugar) resultado.ubicacion = errorLugar;

    const errorFecha = validarFechaPasada(fechaSuceso, 'La fecha');
    if (errorFecha) resultado.fechaSuceso = errorFecha;

    return resultado;
  }, [fotos, nombre, nombreObligatorio, especieId, descripcion, lugar, fechaSuceso]);

  const formularioValido = Object.keys(errores).length === 0;
  const puedePublicar = formularioValido && ubicacion.estado === 'concedido' && estadoId !== null;

  /**
   * Un error se muestra cuando el campo ya fue tocado o cuando se intentó publicar, para que
   * el formulario no aparezca todo en rojo apenas se abre.
   */
  const errorDe = (campo: keyof ErroresFormulario): string | undefined =>
    mostrarErrores || tocados[campo] ? errores[campo] : undefined;

  const marcarTocado = (campo: keyof ErroresFormulario): void =>
    setTocados((previos) => ({ ...previos, [campo]: true }));

  /** Al tocar el botón deshabilitado: revelar los errores y decir qué falta (criterio 5). */
  const explicarQueFalta = (): void => {
    setMostrarErrores(true);

    const faltantes = (Object.keys(errores) as (keyof ErroresFormulario)[]).map(
      (campo) => ETIQUETAS[campo],
    );

    if (faltantes.length > 0) {
      toast.mostrarAdvertencia(`Todavía falta completar ${enumerar(faltantes)}.`);
      return;
    }

    if (ubicacion.estado !== 'concedido') {
      toast.mostrarAdvertencia('Permití el acceso a tu ubicación para publicar el aviso.');
    }
  };

  const publicar = async (): Promise<void> => {
    setMostrarErrores(true);
    if (
      !puedePublicar ||
      fotos.length === 0 ||
      !fechaSuceso ||
      estadoId === null ||
      especieId === null
    ) {
      return;
    }

    setGuardando(true);
    try {
      const coordenadas = await ubicacion.obtenerCoordenadas();

      const aviso = await crearAviso({
        estadoId,
        nombre: nombre.trim(),
        especieId,
        descripcion: descripcion.trim(),
        ubicacion: lugar.trim(),
        fechaSuceso,
        latitud: coordenadas.latitud,
        longitud: coordenadas.longitud,
        fotos,
      });

      // Criterio 4, en voseo: la HU lo escribe "Has creado una publicación".
      toast.mostrarExito('Creaste una publicación.');
      avisarAvisoCreado(aviso);
      router.back();
    } catch (err) {
      // Se queda en la pantalla con todo lo cargado, para poder reintentar. Los mensajes del
      // backend y los de la ubicación ya vienen listos para mostrar.
      toast.mostrarError(
        err instanceof Error ? err.message : 'No pudimos publicar el aviso. Intentalo de nuevo.',
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View className="flex-1 bg-organic-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center gap-3 border-b border-organic-neutral-300 bg-organic-surface px-[22px] pb-4 pt-2">
          <BotonCircular
            icono="arrow-back"
            etiqueta="Cancelar y volver"
            onPress={() => router.back()}
            grande
          />
          <Text className="font-titulo text-[28px] leading-[32px] text-organic-accent-600">
            Reportar mascota
          </Text>
        </View>

        {cargandoCatalogos ? (
          <EstadoCargando />
        ) : errorCatalogos ? (
          <EstadoError mensaje={errorCatalogos} onAccion={() => setIntento((n) => n + 1)} />
        ) : (
          <FormularioConTeclado
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-10 pt-4"
            showsVerticalScrollIndicator={false}
          >
            <Segmentado
              opciones={opcionesEstado}
              valor={estadoId}
              onChange={setEstadoId}
              variante="organica"
              grande
            />

            <PhotosPickerField
              fotos={fotos}
              onChange={setFotos}
              maximo={animalPerdido.imagenes.max}
              error={errorDe('foto')}
            />

            <FormCard>
              <FormCardRow>
                <TextField
                  label={nombreObligatorio ? 'Nombre' : 'Nombre (si se sabe)'}
                  obligatorio={nombreObligatorio}
                  placeholder="Ej. Rocky"
                  value={nombre}
                  onChangeText={setNombre}
                  onBlur={() => marcarTocado('nombre')}
                  maxLength={animalPerdido.nombre.max}
                  error={errorDe('nombre')}
                  grande
                />
              </FormCardRow>

              <FormCardRow>
                <SelectField
                  label="Especie"
                  obligatorio
                  placeholder="Elegí"
                  opciones={especies.map((especie) => ({
                    valor: especie.id,
                    etiqueta: especie.nombre,
                  }))}
                  valor={especieId}
                  onChange={setEspecieId}
                  onBlur={() => marcarTocado('especieId')}
                  error={errorDe('especieId')}
                  grande
                />
              </FormCardRow>

              <FormCardRow>
                <TextAreaField
                  label="Descripción"
                  obligatorio
                  placeholder="Color, raza, señas particulares…"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  onBlur={() => marcarTocado('descripcion')}
                  maximo={animalPerdido.descripcion.max}
                  error={errorDe('descripcion')}
                  grande
                />
              </FormCardRow>

              <FormCardRow>
                <TextField
                  label="Lugar / barrio"
                  obligatorio
                  placeholder="Ej. Godoy Cruz"
                  value={lugar}
                  onChangeText={setLugar}
                  onBlur={() => marcarTocado('ubicacion')}
                  maxLength={animalPerdido.ubicacion.max}
                  error={errorDe('ubicacion')}
                  grande
                />
              </FormCardRow>

              <FormCardRow ultima>
                <DateField
                  label="Fecha"
                  obligatorio
                  placeholder="Elegí la fecha"
                  valor={fechaSuceso}
                  onChange={setFechaSuceso}
                  onBlur={() => marcarTocado('fechaSuceso')}
                  fechaMaxima={new Date()}
                  mostrarEdad={false}
                  error={errorDe('fechaSuceso')}
                  grande
                />
              </FormCardRow>
            </FormCard>

            {ubicacion.estado === 'denegado' || ubicacion.estado === 'bloqueado' ? (
              <Nota
                texto="Para publicar el aviso necesitamos la ubicación de tu teléfono en ese momento. No se muestra en la publicación: ahí sólo va el lugar que escribiste."
                accion={{
                  etiqueta:
                    ubicacion.estado === 'bloqueado' ? 'Abrir ajustes' : 'Permitir ubicación',
                  onPress: ubicacion.permitir,
                }}
              />
            ) : null}

            <CustomButton
              title="Publicar reporte"
              variant="acento"
              loading={guardando}
              disabled={!puedePublicar}
              onPress={() => void publicar()}
              onPressDeshabilitado={explicarQueFalta}
            />
          </FormularioConTeclado>
        )}
      </SafeAreaView>
    </View>
  );
}
