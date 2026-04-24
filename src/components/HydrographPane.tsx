import Plot from 'react-plotly.js';
import { forwardRef } from 'react';
import type { Episode, Headers, Row } from '../core/types';

interface Props {
  rows: Row[];
  headers: Headers;
  episodes?: Episode[];
}

export const HydrographPane = forwardRef<HTMLDivElement, Props>(function HydrographPane(
  { rows, headers, episodes = [] },
  ref,
) {
  const t = rows.map((r) => r.t);
  const r = rows.map((row) => row.r);
  const p = rows.map((row) => row.p);

  const shapes = episodes.map((ep) => ({
    type: 'rect' as const,
    xref: 'x' as const,
    yref: 'paper' as const,
    x0: ep.tStart,
    x1: ep.tEnd,
    y0: 0,
    y1: 1,
    fillcolor: 'rgba(60, 120, 255, 0.12)',
    line: { width: 0 },
  }));

  return (
    <div ref={ref} className="plot-wrap">
      <Plot
        data={[
          {
            x: t,
            y: r,
            type: 'scatter',
            mode: 'lines',
            name: headers.r,
            line: { color: '#1f77b4' },
          },
          {
            x: t,
            y: p,
            type: 'scatter',
            mode: 'lines',
            name: headers.p,
            line: { color: '#2ca02c', dash: 'dot' },
            yaxis: 'y2',
          },
        ]}
        layout={{
          title: { text: 'Hydrograph (water level) + cumulative precipitation' },
          xaxis: { title: { text: headers.t } },
          yaxis: { title: { text: headers.r } },
          yaxis2: {
            title: { text: headers.p },
            overlaying: 'y',
            side: 'right',
          },
          shapes,
          margin: { t: 40, l: 60, r: 60, b: 50 },
          legend: { orientation: 'h' },
        }}
        config={{ displaylogo: false, responsive: true }}
        style={{ width: '100%', height: 380 }}
        useResizeHandler
      />
    </div>
  );
});
