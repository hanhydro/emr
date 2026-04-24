import type { DataType } from '../state/store';

export interface TypeLabels {
  rName: string;               // "water level" / "streamflow"
  rAxisFallback: string;       // "E" / "Q" — used when CSV header is missing units
  pAxisFallback: string;       // "P" — cumulative precipitation
  showSy: boolean;             // Sy only applies to WT (recharge = Sy·Δh)
  rechargeLabel: string;       // column/bar label in outputs
  rechargeShort: string;       // short/csv column name
  exampleHeader: string;       // one-line suggestion shown on upload
}

export function labelsFor(type: DataType): TypeLabels {
  if (type === 'Q') {
    return {
      rName: 'streamflow',
      rAxisFallback: 'Q',
      pAxisFallback: 'P',
      showSy: false,
      rechargeLabel: 'Δh (rise in Q)',
      rechargeShort: 'deltaH',
      exampleHeader: 't (d), Q (m³/s), P (mm)',
    };
  }
  return {
    rName: 'water level',
    rAxisFallback: 'E',
    pAxisFallback: 'P',
    showSy: true,
    rechargeLabel: 'recharge (Sy·Δh)',
    rechargeShort: 'recharge',
    exampleHeader: 't (d), E (m), P (mm)',
  };
}
