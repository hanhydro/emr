import type { Row } from './types';

export function derivative(rows: Row[]): number[] {
  const n = rows.length;
  const d = new Array<number>(n).fill(0);
  if (n < 2) return d;
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      d[i] = (rows[1].r - rows[0].r) / (rows[1].t - rows[0].t);
    } else if (i === n - 1) {
      d[i] = (rows[n - 1].r - rows[n - 2].r) / (rows[n - 1].t - rows[n - 2].t);
    } else {
      d[i] = (rows[i + 1].r - rows[i - 1].r) / (rows[i + 1].t - rows[i - 1].t);
    }
  }
  return d;
}

export function incrementalPrecip(rows: Row[]): number[] {
  const n = rows.length;
  const dp = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    dp[i] = Math.max(0, rows[i].p - rows[i - 1].p);
  }
  return dp;
}

export function linearRegression(
  xs: number[],
  ys: number[],
): { a: number; b: number; rSquared: number } {
  const n = xs.length;
  if (n < 2) return { a: 0, b: 0, rSquared: 0 };
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const b = sxx === 0 ? 0 : sxy / sxx;
  const a = my - b * mx;
  const rSquared = syy === 0 ? 1 : 1 - (syy - b * sxy) / syy;
  return { a, b, rSquared };
}
