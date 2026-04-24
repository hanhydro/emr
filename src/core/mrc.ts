import type { MrcFit, MrcParams, Row, SlopeElement } from './types';
import { incrementalPrecip, linearRegression } from './timeseries';

export function findSlopeElements(rows: Row[], params: MrcParams): SlopeElement[] {
  const n = rows.length;
  if (n < 2) return [];
  const dp = incrementalPrecip(rows);

  const lastPrecipTime = new Array<number>(n).fill(-Infinity);
  for (let i = 0; i < n; i++) {
    lastPrecipTime[i] = dp[i] > params.pNegligible
      ? rows[i].t
      : i > 0 ? lastPrecipTime[i - 1] : -Infinity;
  }

  const elements: SlopeElement[] = [];
  let i = 0;
  while (i < n - 1) {
    const t0 = rows[i].t;
    const r0 = rows[i].r;
    const sincePrecip = t0 - lastPrecipTime[i];
    if (
      r0 < params.rMin ||
      r0 > params.rMax ||
      sincePrecip < params.tSincePrecip
    ) {
      i++;
      continue;
    }

    let j = i + 1;
    while (j < n) {
      const dt = rows[j].t - rows[j - 1].t;
      if (dt <= 0) break;
      const dr = rows[j].r - rows[j - 1].r;
      const slope = dr / dt;
      if (slope > 0) break;
      if (Math.abs(slope) > params.slopeMax) break;
      if (dp[j] > params.pNegligible) break;
      const dur = rows[j].t - t0;
      if (dur > params.maxElementLen) break;
      j++;
    }

    const duration = rows[j - 1].t - t0;
    if (j - 1 - i >= 1 && duration >= params.minElementLen) {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let k = i; k < j; k++) {
        xs.push(rows[k].t);
        ys.push(rows[k].r);
      }
      const { b } = linearRegression(xs, ys);
      elements.push({
        iStart: i,
        iEnd: j - 1,
        tMid: (rows[i].t + rows[j - 1].t) / 2,
        rMid: (rows[i].r + rows[j - 1].r) / 2,
        dRdt: b,
      });
      i = j;
    } else {
      i++;
    }
  }
  return elements;
}

export function fitMrc(elements: SlopeElement[], twoSegment: boolean): MrcFit {
  const xs = elements.map((e) => e.rMid);
  const ys = elements.map((e) => e.dRdt);

  if (!twoSegment || elements.length < 6) {
    const { a, b, rSquared } = linearRegression(xs, ys);
    return {
      segments: 1,
      a: [a],
      b: [b],
      rSquared,
      elements,
    };
  }

  const sorted = [...xs].sort((p, q) => p - q);
  let best: { breakR: number; a: number[]; b: number[]; rSquared: number } | null = null;
  for (let i = 2; i < sorted.length - 2; i++) {
    const breakR = (sorted[i] + sorted[i + 1]) / 2;
    const xL: number[] = [];
    const yL: number[] = [];
    const xR: number[] = [];
    const yR: number[] = [];
    for (let k = 0; k < xs.length; k++) {
      if (xs[k] <= breakR) {
        xL.push(xs[k]);
        yL.push(ys[k]);
      } else {
        xR.push(xs[k]);
        yR.push(ys[k]);
      }
    }
    if (xL.length < 2 || xR.length < 2) continue;
    const l = linearRegression(xL, yL);
    const r = linearRegression(xR, yR);
    const combined = weightedR2(yL, l, xL, yR, r, xR);
    if (!best || combined > best.rSquared) {
      best = { breakR, a: [l.a, r.a], b: [l.b, r.b], rSquared: combined };
    }
  }

  if (!best) {
    const { a, b, rSquared } = linearRegression(xs, ys);
    return { segments: 1, a: [a], b: [b], rSquared, elements };
  }
  return {
    segments: 2,
    a: best.a,
    b: best.b,
    breakR: best.breakR,
    rSquared: best.rSquared,
    elements,
  };
}

function weightedR2(
  yL: number[],
  l: { a: number; b: number },
  xL: number[],
  yR: number[],
  r: { a: number; b: number },
  xR: number[],
): number {
  const all = [...yL, ...yR];
  const my = all.reduce((a, b) => a + b, 0) / all.length;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < xL.length; i++) {
    const yHat = l.a + l.b * xL[i];
    ssRes += (yL[i] - yHat) ** 2;
    ssTot += (yL[i] - my) ** 2;
  }
  for (let i = 0; i < xR.length; i++) {
    const yHat = r.a + r.b * xR[i];
    ssRes += (yR[i] - yHat) ** 2;
    ssTot += (yR[i] - my) ** 2;
  }
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

export function mrcSlope(fit: MrcFit, r: number): number {
  if (fit.segments === 1) return fit.a[0] + fit.b[0] * r;
  const br = fit.breakR ?? 0;
  const idx = r <= br ? 0 : 1;
  return fit.a[idx] + fit.b[idx] * r;
}
