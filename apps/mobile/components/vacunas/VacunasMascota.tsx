/**
 * Las vacunas de una mascota como medallas. Tocar una abre su detalle (para qué sirve y
 * cuándo se aplicó). La usan la ficha de la mascota y la de la publicación: las dos leen
 * las mismas vacunas, que salen de la historia clínica.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';

import type { VacunaAplicada } from '@/services/vacunas';

import { DetalleVacuna } from './DetalleVacuna';
import { MedallaVacuna } from './MedallaVacuna';

interface VacunasMascotaProps {
  vacunas: VacunaAplicada[];
  /** Texto cuando no tiene ninguna. */
  textoVacio?: string;
  /** Medallas más grandes; ver `MedallaVacuna`. */
  grande?: boolean;
}

export function VacunasMascota({
  vacunas,
  textoVacio = 'No tiene vacunas registradas',
  grande = false,
}: VacunasMascotaProps) {
  const [detalle, setDetalle] = useState<VacunaAplicada | null>(null);

  if (vacunas.length === 0) {
    return <Text className="font-cuerpo text-base text-organic-neutral-500">{textoVacio}</Text>;
  }

  return (
    <>
      <View className="flex-row flex-wrap gap-2">
        {vacunas.map((vacuna) => (
          <MedallaVacuna
            key={vacuna.tipo}
            tipo={vacuna.tipo}
            nombre={vacuna.nombre}
            accessibilityLabel={`Vacuna ${vacuna.nombre}. Tocá para ver para qué sirve`}
            onPress={() => setDetalle(vacuna)}
            grande={grande}
          />
        ))}
      </View>

      <DetalleVacuna vacuna={detalle} onCerrar={() => setDetalle(null)} />
    </>
  );
}
