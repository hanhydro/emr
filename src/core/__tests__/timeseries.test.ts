import { describe, it, expect } from 'vitest';
import { derivative, incrementalPrecip, linearRegression } from '../timeseries';
import type { Row } from '../types';

describe('derivative', () => {
  it('matches the analytic derivative of a linear function', () => {
    const rows: Row[] = [];
    for (let i = 0; i < 20; i++) rows.push({ t: i, r: 2 * i + 3, p: 0 });
    const d = derivative(rows);
    for (const v of d) expect(v).toBeCloseTo(2, 8);
  });

  it('is near -k on exp(-k t) for an interior point', () => {
    const rows: Row[] = [];
    const k = 0.1;
    for (let i = 0; i <= 100; i++) rows.push({ t: i, r: Math.exp(-k * i), p: 0 });
    const d = derivative(rows);
    // dR/dt at t=50 ≈ -k * R(50)
    expect(d[50]).toBeCloseTo(-k * Math.exp(-k * 50), 3);
  });
});

describe('incrementalPrecip', () => {
  it('is the positive first difference of cumulative precip', () => {
    const rows: Row[] = [
      { t: 0, r: 0, p: 0 },
      { t: 1, r: 0, p: 5 },
      { t: 2, r: 0, p: 5 },
      { t: 3, r: 0, p: 12 },
    ];
    expect(incrementalPrecip(rows)).toEqual([0, 5, 0, 7]);
  });
});

describe('linearRegression', () => {
  it('recovers slope and intercept of a noiseless line', () => {
    const xs = [0, 1, 2, 3, 4, 5];
    const ys = xs.map((x) => 2.5 * x - 1);
    const { a, b, rSquared } = linearRegression(xs, ys);
    expect(a).toBeCloseTo(-1, 8);
    expect(b).toBeCloseTo(2.5, 8);
    expect(rSquared).toBeCloseTo(1, 8);
  });
});
