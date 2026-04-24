import type { Episode, Headers, MrcFit, MrcParams, EmrParams, Row, RunResult } from './types';

export function downloadText(filename: string, text: string, mime = 'text/plain'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function episodesToCsv(episodes: Episode[], headers: Headers): string {
  const head = [
    'episode',
    `t_start (${headers.t})`,
    `t_peak (${headers.t})`,
    `t_end (${headers.t})`,
    `r_start (${headers.r})`,
    `r_peak (${headers.r})`,
    `r_end (${headers.r})`,
    `mrc_B (${headers.r})`,
    `mrc_F (${headers.r})`,
    `deltaH (${headers.r})`,
    `recharge (${headers.r})`,
    `matched_precip (${headers.p})`,
  ];
  const lines = [head.join(',')];
  for (const e of episodes) {
    lines.push(
      [
        e.index + 1,
        e.tStart,
        e.tPeak,
        e.tEnd,
        e.rStart,
        e.rPeak,
        e.rEnd,
        e.mrcB,
        e.mrcF,
        e.deltaH,
        e.recharge,
        e.matchedPrecip,
      ].join(','),
    );
  }
  return lines.join('\n');
}

export function seriesToCsv(rows: Row[], headers: Headers): string {
  const head = [headers.t, headers.r, headers.p].join(',');
  const lines = [head];
  for (const r of rows) lines.push([r.t, r.r, r.p].join(','));
  return lines.join('\n');
}

function resolvePlotDiv(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  if ((el as unknown as { _fullLayout?: unknown })._fullLayout) return el;
  const inner = el.querySelector('.js-plotly-plot') as HTMLElement | null;
  return inner;
}

export async function downloadPng(plotDiv: HTMLElement | null, filename: string): Promise<void> {
  const target = resolvePlotDiv(plotDiv);
  if (!target) return;
  const Plotly = (await import('plotly.js-dist-min')).default;
  const png = await Plotly.toImage(target, { format: 'png', width: 1200, height: 600 });
  const a = document.createElement('a');
  a.href = png;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadPdfReport(opts: {
  plotDivs: (HTMLElement | null)[];
  result: RunResult;
  mrc: MrcFit;
  headers: Headers;
  mrcParams: MrcParams;
  emrParams: EmrParams;
}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const Plotly = (await import('plotly.js-dist-min')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const margin = 36;
  let y = margin;

  doc.setFontSize(16);
  doc.text('Water Table Fluctuation — MRC + EMR', margin, y);
  y += 20;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toISOString()}`, margin, y);
  y += 18;

  doc.setFontSize(12);
  doc.text('Parameters', margin, y);
  y += 14;
  doc.setFontSize(10);
  const paramLines = [
    `MRC: Rmin=${opts.mrcParams.rMin}, Rmax=${opts.mrcParams.rMax}, tSincePrecip=${opts.mrcParams.tSincePrecip}, Pnegligible=${opts.mrcParams.pNegligible}, slopeMax=${opts.mrcParams.slopeMax}, minLen=${opts.mrcParams.minElementLen}, maxLen=${opts.mrcParams.maxElementLen}, segments=${opts.mrc.segments}`,
    `MRC fit: ${opts.mrc.segments === 1
      ? `dR/dt = ${opts.mrc.a[0].toFixed(4)} + ${opts.mrc.b[0].toFixed(4)}·R,  R² = ${opts.mrc.rSquared.toFixed(3)}`
      : `2-seg at R* = ${opts.mrc.breakR?.toFixed(3)};  L: dR/dt = ${opts.mrc.a[0].toFixed(4)} + ${opts.mrc.b[0].toFixed(4)}·R;  R: dR/dt = ${opts.mrc.a[1].toFixed(4)} + ${opts.mrc.b[1].toFixed(4)}·R,  R² = ${opts.mrc.rSquared.toFixed(3)}`}`,
    `EMR: Sy=${opts.emrParams.sy}, Fd=${opts.emrParams.fd}, tLag=${opts.emrParams.tLag}`,
    `Episodes: ${opts.result.totals.count} | Total recharge: ${opts.result.totals.recharge.toFixed(4)} | Matched precip: ${opts.result.totals.precip.toFixed(4)} | Ratio: ${opts.result.totals.ratio.toFixed(3)}`,
  ];
  for (const line of paramLines) {
    doc.text(line, margin, y, { maxWidth: 540 });
    y += 14;
  }
  y += 6;

  const labels = ['Hydrograph', 'MRC fit', 'Recharge episodes'];
  for (let i = 0; i < opts.plotDivs.length; i++) {
    const target = resolvePlotDiv(opts.plotDivs[i]);
    if (!target) continue;
    const png = await Plotly.toImage(target, { format: 'png', width: 1000, height: 500 });
    if (y > 500) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(12);
    doc.text(labels[i] ?? `Plot ${i + 1}`, margin, y);
    y += 12;
    doc.addImage(png, 'PNG', margin, y, 540, 270);
    y += 280;
  }

  doc.addPage();
  y = margin;
  doc.setFontSize(12);
  doc.text('Episodes', margin, y);
  y += 16;
  doc.setFontSize(9);
  const cols = ['#', 't_start', 't_peak', 't_end', 'Δh', 'recharge', 'precip'];
  doc.text(cols.join('     '), margin, y);
  y += 12;
  for (const e of opts.result.episodes) {
    if (y > 750) {
      doc.addPage();
      y = margin;
    }
    doc.text(
      [
        e.index + 1,
        e.tStart.toFixed(2),
        e.tPeak.toFixed(2),
        e.tEnd.toFixed(2),
        e.deltaH.toFixed(3),
        e.recharge.toFixed(3),
        e.matchedPrecip.toFixed(3),
      ].join('     '),
      margin,
      y,
    );
    y += 12;
  }

  doc.save('emr-report.pdf');
}
