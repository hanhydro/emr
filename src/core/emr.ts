import type { EmrParams, Episode, MrcFit, Row, RunResult } from './types';
import { mrcSlope } from './mrc';
import { derivative, incrementalPrecip } from './timeseries';

export function findEpisodes(
  rows: Row[],
  fit: MrcFit,
  params: EmrParams,
): Episode[] {
  const n = rows.length;
  const d = derivative(rows);
  const dp = incrementalPrecip(rows);
  const episodes: Episode[] = [];

  let lastPrecip = -Infinity;
  for (let i = 0; i < n; i++) {
    if (dp[i] > 0) lastPrecip = rows[i].t;
    const withinLag = rows[i].t - lastPrecip <= params.tLag;
    if (!withinLag) continue;
    if (d[i] <= params.fd) continue;

    // Walk back from the trigger to the local minimum before the rise —
    // the true pre-episode baseline for MRC-B projection.
    let iStart = i;
    while (iStart > 0 && rows[iStart].r > rows[iStart - 1].r) iStart--;

    let j = i;
    let peak = i;
    while (j < n) {
      if (rows[j].r > rows[peak].r) peak = j;
      if (j > peak && d[j] <= params.fd) break;
      j++;
    }
    const iPeak = peak;
    const iEnd = Math.min(j, n - 1);

    const rStart = rows[iStart].r;
    const rPeak = rows[iPeak].r;

    let mrcB = rStart;
    for (let k = iStart + 1; k <= iPeak; k++) {
      const dt = rows[k].t - rows[k - 1].t;
      if (dt > 0) mrcB += mrcSlope(fit, mrcB) * dt;
    }

    let mrcF = rows[iEnd].r;
    for (let k = iEnd; k > iPeak; k--) {
      const dt = rows[k].t - rows[k - 1].t;
      if (dt > 0) mrcF -= mrcSlope(fit, mrcF) * dt;
    }

    const deltaH = mrcF - mrcB;
    const recharge = params.sy * Math.max(0, deltaH);

    let matchedPrecip = 0;
    for (let k = 0; k < n; k++) {
      if (
        rows[k].t >= rows[iStart].t - params.tLag &&
        rows[k].t <= rows[iPeak].t
      ) {
        matchedPrecip += dp[k];
      }
    }

    episodes.push({
      index: episodes.length,
      tStart: rows[iStart].t,
      tPeak: rows[iPeak].t,
      tEnd: rows[iEnd].t,
      rStart,
      rPeak,
      rEnd: rows[iEnd].r,
      mrcB,
      mrcF,
      deltaH,
      recharge,
      matchedPrecip,
    });

    const nextStart = Math.max(iEnd, iPeak) + 1;
    i = nextStart - 1;
  }
  return episodes;
}

export function computeRun(
  rows: Row[],
  fit: MrcFit,
  params: EmrParams,
): RunResult {
  const episodes = findEpisodes(rows, fit, params);
  const recharge = episodes.reduce((s, e) => s + e.recharge, 0);
  const precip = episodes.reduce((s, e) => s + e.matchedPrecip, 0);

  const mrcBSeries: { t: number; v: number }[] = [];
  const mrcFSeries: { t: number; v: number }[] = [];
  for (const ep of episodes) {
    mrcBSeries.push({ t: ep.tStart, v: ep.rStart });
    mrcBSeries.push({ t: ep.tPeak, v: ep.mrcB });
    mrcFSeries.push({ t: ep.tPeak, v: ep.mrcF });
    mrcFSeries.push({ t: ep.tEnd, v: ep.rEnd });
  }

  return {
    episodes,
    totals: {
      count: episodes.length,
      recharge,
      precip,
      ratio: precip > 0 ? recharge / precip : 0,
    },
    mrcBSeries,
    mrcFSeries,
  };
}
