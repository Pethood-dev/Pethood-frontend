/**
 * Tests de la validación numérica (espejo del backend).
 *
 *     cd apps/mobile && node --test --experimental-strip-types shared/validation/numbers.test.ts
 */
/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filtrarEntradaDecimal, validarDecimal } from './numbers.ts';

const META = { min: 10000, max: 2500000, decimales: 0, etiqueta: 'La meta' };

describe('validarDecimal sin decimales', () => {
  it('acepta un entero en rango', () => {
    assert.equal(validarDecimal('150000', META), null);
  });

  it('rechaza separador de miles o decimales con un mensaje claro, sin tirar', () => {
    assert.equal(
      validarDecimal('10.000', META),
      'La meta debe ser un número entero, sin puntos ni comas',
    );
  });
});

describe('filtrarEntradaDecimal sin decimales', () => {
  it('deja sólo dígitos', () => {
    assert.equal(filtrarEntradaDecimal('10.000,5', 0), '100005');
  });
});
