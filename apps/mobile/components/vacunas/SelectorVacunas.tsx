/**
 * Selector de las vacunas que la mascota ya tiene, para el alta (spec 019). Muestra el plan
 * de vacunación de la especie elegida como medallas: se tocan todas las que tenga (varias a
 * la vez) y cada una elegida pide su fecha de aplicación. El ícono de información abre para
 * qué sirve cada vacuna.
 *
 * El backend las guarda como registros de la historia clínica de la mascota.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DateField } from '@/components/ui/DateField';
import { FormField } from '@/components/ui/FormField';
import { PALETA } from '@/constants/theme';
import type { TipoVacuna, VacunaCatalogo } from '@/services/vacunas';

import { DetalleVacuna } from './DetalleVacuna';
import { MedallaVacuna } from './MedallaVacuna';

export interface VacunaElegida {
  tipo: TipoVacuna;
  fecha: Date | null;
}

interface SelectorVacunasProps {
  /** Plan de la especie elegida, en el orden del calendario. */
  opciones: VacunaCatalogo[];
  elegidas: VacunaElegida[];
  onChange: (elegidas: VacunaElegida[]) => void;
  /** Sin especie todavía no hay plan que mostrar. */
  especieElegida: boolean;
  cargando?: boolean;
  /** Error de la fecha de cada vacuna elegida. */
  errores?: Partial<Record<TipoVacuna, string>>;
  /** La fecha de nacimiento: ninguna vacuna puede ser anterior. */
  fechaMinima?: Date;
  grande?: boolean;
}

export function SelectorVacunas({
  opciones,
  elegidas,
  onChange,
  especieElegida,
  cargando = false,
  errores = {},
  fechaMinima,
  grande,
}: SelectorVacunasProps) {
  const [detalle, setDetalle] = useState<VacunaCatalogo | null>(null);

  const elegida = (tipo: TipoVacuna): VacunaElegida | undefined =>
    elegidas.find((vacuna) => vacuna.tipo === tipo);

  const alternar = (tipo: TipoVacuna): void => {
    onChange(
      elegida(tipo)
        ? elegidas.filter((vacuna) => vacuna.tipo !== tipo)
        : [...elegidas, { tipo, fecha: null }],
    );
  };

  const cambiarFecha = (tipo: TipoVacuna, fecha: Date): void => {
    onChange(elegidas.map((vacuna) => (vacuna.tipo === tipo ? { ...vacuna, fecha } : vacuna)));
  };

  const ayuda = !especieElegida
    ? 'Elegí la especie para ver sus vacunas'
    : cargando
      ? 'Cargando vacunas...'
      : opciones.length === 0
        ? 'Esta especie no tiene un plan de vacunas cargado'
        : 'Tocá todas las que ya tiene. Se guardan en su historia clínica.';

  return (
    <FormField label="Vacunas" ayuda={ayuda} conCaja={false} grande={grande}>
      <View className="mt-1 gap-3">
        {opciones.map((opcion) => {
          const seleccion = elegida(opcion.tipo);

          return (
            <View key={opcion.tipo} className="gap-2">
              <View className="flex-row items-center gap-2">
                <MedallaVacuna
                  tipo={opcion.tipo}
                  nombre={opcion.nombre}
                  seleccionada={seleccion !== undefined}
                  onPress={() => alternar(opcion.tipo)}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Para qué sirve ${opcion.nombre}`}
                  onPress={() => setDetalle(opcion)}
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={PALETA.neutral[500]}
                  />
                </Pressable>
              </View>

              {seleccion ? (
                <DateField
                  label={`Fecha de ${opcion.nombre}`}
                  obligatorio
                  placeholder="Elegí la fecha"
                  valor={seleccion.fecha}
                  onChange={(fecha) => cambiarFecha(opcion.tipo, fecha)}
                  mostrarEdad={false}
                  fechaMinima={fechaMinima}
                  error={errores[opcion.tipo]}
                  grande={grande}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <DetalleVacuna vacuna={detalle} onCerrar={() => setDetalle(null)} />
    </FormField>
  );
}
