export interface Headers {
  t: string;
  r: string;
  p: string;
}

export interface Row {
  t: number;
  r: number;
  p: number;
}

export interface SlopeElement {
  iStart: number;
  iEnd: number;
  tMid: number;
  rMid: number;
  dRdt: number;
}

export interface MrcFit {
  segments: 1 | 2;
  // dR/dt = a + b * R   (segment 0 applies for R <= breakR, segment 1 applies for R > breakR)
  a: number[];
  b: number[];
  breakR?: number;
  rSquared: number;
  elements: SlopeElement[];
}

export interface MrcParams {
  rMin: number;
  rMax: number;
  tSincePrecip: number;
  pNegligible: number;
  slopeMax: number;
  minElementLen: number;
  maxElementLen: number;
  twoSegment: boolean;
}

export interface EmrParams {
  sy: number;
  fd: number;
  tLag: number;
}

export interface Episode {
  index: number;
  tStart: number;
  tPeak: number;
  tEnd: number;
  rStart: number;
  rPeak: number;
  rEnd: number;
  mrcB: number;
  mrcF: number;
  deltaH: number;
  recharge: number;
  matchedPrecip: number;
}

export interface RunResult {
  episodes: Episode[];
  totals: {
    count: number;
    recharge: number;
    precip: number;
    ratio: number;
  };
  mrcBSeries: { t: number; v: number }[];
  mrcFSeries: { t: number; v: number }[];
}
