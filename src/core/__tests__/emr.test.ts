import { describe, it, expect } from 'vitest';
import { computeRun } from '../emr';
import { fitMrc, findSlopeElements } from '../mrc';
import type { MrcParams, Row } from '../types';

function makeSeries(): Row[] {
  const rows: Row[] = [];
  const k = 0.05;
  const Efloor = 9;
  let E = 10;
  let P = 0;
  const events = [
    { day: 20, mm: 20, bump: 0.3 },
    { day: 60, mm: 30, bump: 0.4 },
  ];
  for (let t = 0; t <= 100; t++) {
    for (const ev of events) {
      if (t === ev.day) {
        E += ev.bump;
        P += ev.mm;
      }
    }
    rows.push({ t, r: E, p: P });
    E = Efloor + (E - Efloor) * Math.exp(-k);
  }
  return rows;
}

const mrcParams: MrcParams = {
  rMin: -Infinity,
  rMax: Infinity,
  tSincePrecip: 2,
  pNegligible: 0.01,
  slopeMax: 1,
  minElementLen: 2,
  maxElementLen: 20,
  twoSegment: false,
};

describe('EMR', () => {
  it('detects the injected recharge episodes', () => {
    const rows = makeSeries();
    const elems = findSlopeElements(rows, mrcParams);
    const fit = fitMrc(elems, false);
    const run = computeRun(rows, fit, { sy: 0.1, fd: 0.02, tLag: 2 });
    expect(run.totals.count).toBe(2);
    expect(run.episodes[0].recharge).toBeGreaterThan(0);
    expect(run.episodes[1].recharge).toBeGreaterThan(0);
  });

  it('reports zero episodes when fluctuation tolerance is above any rise', () => {
    const rows = makeSeries();
    const elems = findSlopeElements(rows, mrcParams);
    const fit = fitMrc(elems, false);
    const run = computeRun(rows, fit, { sy: 0.1, fd: 100, tLag: 2 });
    expect(run.totals.count).toBe(0);
  });
});
