/**
 * ScrollView para formularios que acompaña al teclado. Reemplaza al par
 * `KeyboardAvoidingView` + `ScrollView` en toda pantalla con campos de texto.
 *
 * Por qué no alcanza con `KeyboardAvoidingView`: desde que Expo activa edge-to-edge por
 * defecto en Android (SDK 54+), la ventana ya no se achica al abrir el teclado, así que ese
 * componente no tiene de dónde calcular nada y deja los campos tapados. En iOS sí hace algo,
 * pero sólo achica la pantalla: no lleva el campo enfocado a la vista.
 *
 * Qué hace este, en las dos plataformas y cuadro a cuadro con la animación del teclado:
 * - Al enfocar un campo, desplaza lo justo para que quede `TECLADO.margenSobreCampo` por
 *   encima del teclado. Si ya se ve, no se mueve.
 * - En un campo multilínea sigue al cursor a medida que se agregan renglones (lee su
 *   posición real, así que también funciona editando en el medio del texto).
 * - Suma abajo el alto del teclado como espacio desplazable: el botón del final del
 *   formulario se alcanza con scroll sin cerrar el teclado.
 * - Al cerrar el teclado vuelve a la posición en la que estaba.
 *
 * Uso: se pasa exactamente lo que se le pasaba al `ScrollView` (`className`,
 * `contentContainerClassName`, etc.), sin envolverlo en `KeyboardAvoidingView`.
 * Requiere el `KeyboardProvider` montado en `app/_layout.tsx`.
 *
 * Si la pantalla tiene botones fijos al pie (fuera del scroll), van en un
 * `KeyboardStickyView` para que suban con el teclado, y su alto se pasa en `altoPieFijo`.
 * Ejemplo: `components/solicitudes/SolicitudModal.tsx`.
 */
import { cssInterop } from 'nativewind';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

import { TECLADO } from '@/constants/teclado';

// NativeWind sólo traduce `className` en los componentes de React Native; en los de una
// librería hay que declararle a qué prop de estilo corresponde cada clase.
cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

/** El margen sobre el teclado no se pasa: sale de `TECLADO` para que sea igual en toda la app. */
type FormularioConTecladoProps = Omit<KeyboardAwareScrollViewProps, 'bottomOffset'> & {
  /**
   * Alto del pie fijo que sube pegado al teclado (`KeyboardStickyView`), si la pantalla lo
   * tiene. Con el teclado abierto ese pie tapa la franja de arriba del teclado, así que el
   * campo enfocado tiene que quedar por encima de los dos.
   */
  altoPieFijo?: number;
};

export function FormularioConTeclado({
  altoPieFijo = 0,
  keyboardShouldPersistTaps = 'handled',
  children,
  ...props
}: FormularioConTecladoProps) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={TECLADO.margenSobreCampo + altoPieFijo}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
