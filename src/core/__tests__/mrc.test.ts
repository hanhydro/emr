import { describe, it, expect } from 'vitest';
import { fitMrc, findSlopeElements } from '../mrc';
import type { MrcParams, Row } from '../types';

function synthRecession(k: number, Efloor: number, E0: number, n: number): Row[] {
  const rows: Row[] = [];
  let E = E0;
  for (let i = 0; i < n; i++) {
    rows.push({ t: i, r: E, p: 0 });
    E = Efloor + (E - Efloor) * Math.exp(-k);
  }
  return rows;
}

const defaultParams: MrcParams = {
  rMin: -Infinity,
  rMax: Infinity,
  tSincePrecip: 0,
  pNegligible: 0.01,
  slopeMax: 10,
  minElementLen: 1,
  maxElementLen: 10,
  twoSegment: false,
};

describe('MRC fit', () => {
  it('recovers a strong negative slope for a pure exponential recession', () => {
    const rows = synthRecession(0.05, 9, 10.5, 100);
    const elems = findSlopeElements(rows, defaultParams);
    expect(elems.length).toBeGreaterThan(2);
    const fit = fitMrc(elems, false);
    expect(fit.rSquared).toBeGreaterThan(0.8);
    // dR/dt = -k(R - Efloor) → slope in (dR/dt vs R) should be negative (≈ -k).
    expect(fit.b[0]).toBeLessThan(0);
    expect(fit.b[0]).toBeGreaterThan(-0.2);
  });

  it('does not extend a slope element across a precipitation event', () => {
    const rows = synthRecession(0.05, 9, 10.5, 30);
    rows[15].p = 20;
    for (let i = 16; i < rows.length; i++) rows[i].p = 20;
    const elems = findSlopeElements(rows, { ...defaultParams, pNegligible: 0.1 });
    for (const e of elems) {
      const startT = rows[e.iStart].t;
      const endT = rows[e.iEnd].t;
      // No element should straddle the precip index at t=15.
      expect(!(startT < 15 && endT >= 15)).toBe(true);
    }
  });
});
