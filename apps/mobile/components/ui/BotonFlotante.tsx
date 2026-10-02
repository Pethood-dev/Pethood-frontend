/**
 * Botón flotante "+" de creación, abajo a la derecha: el de "Mis mascotas" y el del portal de
 * mascotas perdidas (GUI-06). Naranja (`accent-600`) en toda la app, también donde la HU lo
 * pedía amarillo.
 *
 * Recibe las props de `Pressable` para poder ir dentro de un `<Link asChild>`.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { PALETA } from '@/constants/theme';

interface BotonFlotanteProps extends Omit<PressableProps, 'children' | 'className'> {
  accessibilityLabel: string;
  icono?: keyof typeof Ionicons.glyphMap;
}

export function BotonFlotante({ icono = 'add', ...props }: BotonFlotanteProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      className="absolute bottom-6 right-6 h-[68px] w-[68px] items-center justify-center rounded-full bg-organic-accent-600 shadow-lg active:opacity-90"
    >
      <Ionicons name={icono} size={34} color={PALETA.blanco} />
    </Pressable>
  );
}
