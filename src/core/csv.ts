import Papa from 'papaparse';
import type { Headers, Row } from './types';

export interface ParsedCsv {
  rows: Row[];
  headers: Headers;
  rawHeaders: string[];
}

export function parseCsv(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  });
  if (result.errors.length) {
    throw new Error(result.errors[0].message);
  }
  const rawHeaders = result.meta.fields ?? [];
  if (rawHeaders.length < 3) {
    throw new Error(
      `CSV must have at least 3 columns (time, water level, cumulative precip); found ${rawHeaders.length}.`,
    );
  }
  const headers: Headers = {
    t: rawHeaders[0],
    r: rawHeaders[1],
    p: rawHeaders[2],
  };
  const rows: Row[] = [];
  for (const raw of result.data) {
    const t = Number(raw[headers.t]);
    const r = Number(raw[headers.r]);
    const p = Number(raw[headers.p]);
    if (!Number.isFinite(t) || !Number.isFinite(r) || !Number.isFinite(p)) {
      continue;
    }
    rows.push({ t, r, p });
  }
  if (rows.length < 2) {
    throw new Error('CSV has fewer than 2 valid numeric rows.');
  }
  return { rows, headers, rawHeaders };
}
