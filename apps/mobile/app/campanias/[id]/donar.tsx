/**
 * Donar a una campaña (spec 021, HU-12.2 y HU-12.3). No está en el prototipo.
 *
 * Muestra alias y/o CBU para transferir desde el homebanking o la billetera, y un campo con el
 * monto transferido. «Terminar donación» avisa al refugio: la donación queda Pendiente y suma
 * a la campaña recién cuando el refugio confirma que recibió la plata (regla transversal 11).
 */
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '@/components/CustomButton';
import { EstadoCargando, EstadoError } from '@/components/feedback/EstadosPantalla';
import { useToast } from '@/components/feedback/Toast';
import { BotonCircular } from '@/components/ui/BotonCircular';
import { FormularioConTeclado } from '@/components/ui/FormularioConTeclado';
import { Nota } from '@/components/ui/Nota';
import { TextField } from '@/components/ui/TextField';
import { PALETA } from '@/constants/theme';
import { formatearPesos } from '@/lib/campanias';
import { ApiError } from '@/services/api';
import { donar, obtenerCampania, type Campania } from '@/services/campanias';
import { LIMITES } from '@/shared/validation/limits';
import { filtrarEntradaDecimal, validarDecimal } from '@/shared/validation/numbers';

const { monto: LIMITE_MONTO } = LIMITES.donacion;

function DatoParaCopiar({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const toast = useToast();

  const copiar = async (): Promise<void> => {
    await Clipboard.setStringAsync(valor);
    toast.mostrarExito(`Copiaste el ${etiqueta.toLowerCase()}.`);
  };

  return (
    <View className="flex-row items-center justify-between gap-3 rounded-[16px] bg-organic-bg px-4 py-3">
      <View className="min-w-0 flex-1">
        <Text className="font-cuerpo-bold text-[11px] uppercase tracking-[1px] text-organic-neutral-600">
          {etiqueta}
        </Text>
        <Text selectable className="font-cuerpo-bold text-[16px] text-organic-neutral-900">
          {valor}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Copiar ${etiqueta}`}
        onPress={() => void copiar()}
        hitSlop={8}
        className="active:opacity-60"
      >
        <Ionicons name="copy-outline" size={22} color={PALETA.accent[600]} />
      </Pressable>
    </View>
  );
}

export default function DonarCampaniaScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaniaId = Number(id);

  const [campania, setCampania] = useState<Campania | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [monto, setMonto] = useState('');
  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setError(null);
    obtenerCampania(campaniaId)
      .then(setCampania)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'No pudimos cargar la campaña. Revisá tu conexión e intentalo de nuevo.',
        ),
      );
  }, [campaniaId, intento]);

  const errorMonto = validarDecimal(monto, { ...LIMITE_MONTO, etiqueta: 'El monto' });

  const terminar = async (): Promise<void> => {
    setTocado(true);
    if (errorMonto) return;

    setEnviando(true);
    try {
      await donar(campaniaId, monto);
      toast.mostrarExito('¡Gracias! El refugio va a confirmar tu donación.');
      router.back();
    } catch (err) {
      toast.mostrarError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos registrar tu donación. Intentalo de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View className="flex-1 bg-organic-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center gap-3 border-b border-organic-neutral-300 bg-organic-surface px-[22px] pb-4 pt-2">
          <BotonCircular
            icono="arrow-back"
            etiqueta="Volver"
            onPress={() => router.back()}
            grande
          />
          <Text className="font-titulo text-[28px] leading-[32px] text-organic-accent-600">
            Donar
          </Text>
        </View>

        {error ? (
          <EstadoError mensaje={error} onAccion={() => setIntento((n) => n + 1)} />
        ) : !campania ? (
          <EstadoCargando />
        ) : (
          <FormularioConTeclado
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-10 pt-4"
          >
            <View className="gap-1">
              <Text className="font-cuerpo-bold text-[12px] uppercase tracking-[1px] text-organic-accent-600">
                {campania.refugio.nombre}
              </Text>
              <Text className="font-titulo text-[22px] leading-[26px] text-organic-neutral-900">
                {campania.titulo}
              </Text>
              <Text className="font-cuerpo text-[14px] text-organic-neutral-600">
                Recaudado {formatearPesos(campania.recaudado)} de{' '}
                {formatearPesos(campania.objetivo)}
              </Text>
            </View>

            <View className="gap-2 rounded-[22px] bg-organic-surface p-4">
              <Text className="font-cuerpo-bold text-[15px] text-organic-neutral-900">
                1. Transferí desde tu banco o billetera
              </Text>
              {campania.alias ? <DatoParaCopiar etiqueta="Alias" valor={campania.alias} /> : null}
              {campania.cbu ? <DatoParaCopiar etiqueta="CBU / CVU" valor={campania.cbu} /> : null}
            </View>

            <View className="gap-2 rounded-[22px] bg-organic-surface p-4">
              <Text className="font-cuerpo-bold text-[15px] text-organic-neutral-900">
                2. Contanos cuánto transferiste
              </Text>
              <TextField
                label="Monto que transferiste ($)"
                obligatorio
                placeholder="Ej. 5000"
                keyboardType="decimal-pad"
                value={monto}
                onChangeText={(texto) =>
                  setMonto(filtrarEntradaDecimal(texto, LIMITE_MONTO.decimales))
                }
                onBlur={() => setTocado(true)}
                error={tocado && errorMonto ? errorMonto : undefined}
                grande
              />
            </View>

            <Nota texto="Tu donación se suma a la campaña cuando el refugio confirme que recibió la transferencia." />

            <CustomButton
              title="Terminar donación"
              variant="acento"
              loading={enviando}
              disabled={!!errorMonto}
              onPress={() => void terminar()}
              onPressDeshabilitado={() => setTocado(true)}
            />
          </FormularioConTeclado>
        )}
      </SafeAreaView>
    </View>
  );
}
