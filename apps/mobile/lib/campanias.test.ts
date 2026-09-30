/**
 * Tests de los textos y cuentas de campañas.
 *
 *     cd apps/mobile && node --test --experimental-strip-types lib/campanias.test.ts
 */
/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  accionesDisponibles,
  formatearPesos,
  textoDonantes,
  textoPendientes,
} from './campanias.ts';

describe('formatearPesos', () => {
  it('separa miles con punto y omite centavos en cero', () => {
    assert.equal(formatearPesos(1430000), '$1.430.000');
    assert.equal(formatearPesos(500), '$500');
  });

  it('muestra centavos con coma cuando los hay', () => {
    assert.equal(formatearPesos(5000.5), '$5.000,50');
  });
});

describe('textoDonantes', () => {
  it('singular y plural', () => {
    assert.equal(textoDonantes(1), '1 donante');
    assert.equal(textoDonantes(23), '23 donantes');
  });
});

describe('textoPendientes', () => {
  it('nada si no hay pendientes', () => {
    assert.equal(textoPendientes(0), null);
  });

  it('singular y plural en voseo', () => {
    assert.equal(textoPendientes(1), 'Tenés 1 donación para revisar');
    assert.equal(textoPendientes(3), 'Tenés 3 donaciones para revisar');
  });
});

describe('accionesDisponibles', () => {
  it('sigue la máquina de estados de la spec 021', () => {
    assert.deepEqual(accionesDisponibles('Activa'), ['finalizar', 'cancelar']);
    assert.deepEqual(accionesDisponibles('Inactiva'), ['cancelar']);
    assert.deepEqual(accionesDisponibles('Finalizada'), []);
    assert.deepEqual(accionesDisponibles('Cancelada'), []);
  });
});
