import Plot from 'react-plotly.js';
import { forwardRef } from 'react';
import type { Episode, Headers } from '../core/types';

interface Props {
  episodes: Episode[];
  headers: Headers;
}

export const EpisodesPane = forwardRef<HTMLDivElement, Props>(function EpisodesPane(
  { episodes, headers },
  ref,
) {
  const x = episodes.map((e) => e.tPeak);
  const rech = episodes.map((e) => e.recharge);
  const precip = episodes.map((e) => e.matchedPrecip);
  return (
    <div ref={ref} className="plot-wrap">
      <Plot
        data={[
          {
            x,
            y: rech,
            type: 'bar',
            name: `recharge (Sy·Δh, ${headers.r})`,
            marker: { color: '#1f77b4' },
          },
          {
            x,
            y: precip,
            type: 'bar',
            name: `matched precip (${headers.p})`,
            marker: { color: '#2ca02c' },
            yaxis: 'y2',
          },
        ]}
        layout={{
          title: { text: 'Recharge episodes' },
          barmode: 'group',
          xaxis: { title: { text: headers.t } },
          yaxis: { title: { text: `recharge (${headers.r})` } },
          yaxis2: {
            title: { text: `precipitation (${headers.p})` },
            overlaying: 'y',
            side: 'right',
          },
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
