import Plot from 'react-plotly.js';
import { forwardRef } from 'react';
import type { Headers, MrcFit } from '../core/types';

interface Props {
  fit: MrcFit;
  headers: Headers;
}

export const MrcFitPane = forwardRef<HTMLDivElement, Props>(function MrcFitPane(
  { fit, headers },
  ref,
) {
  const xs = fit.elements.map((e) => e.rMid);
  const ys = fit.elements.map((e) => e.dRdt);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const lineTraces = [];
  if (fit.segments === 1) {
    lineTraces.push({
      x: [xMin, xMax],
      y: [fit.a[0] + fit.b[0] * xMin, fit.a[0] + fit.b[0] * xMax],
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `dR/dt = ${fit.a[0].toFixed(3)} + ${fit.b[0].toFixed(3)}·R`,
      line: { color: '#d62728' },
    });
  } else {
    const br = fit.breakR ?? (xMin + xMax) / 2;
    lineTraces.push(
      {
        x: [xMin, br],
        y: [fit.a[0] + fit.b[0] * xMin, fit.a[0] + fit.b[0] * br],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `L: ${fit.a[0].toFixed(3)} + ${fit.b[0].toFixed(3)}·R`,
        line: { color: '#d62728' },
      },
      {
        x: [br, xMax],
        y: [fit.a[1] + fit.b[1] * br, fit.a[1] + fit.b[1] * xMax],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `R: ${fit.a[1].toFixed(3)} + ${fit.b[1].toFixed(3)}·R`,
        line: { color: '#ff7f0e' },
      },
    );
  }

  return (
    <div ref={ref} className="plot-wrap">
      <Plot
        data={[
          {
            x: xs,
            y: ys,
            type: 'scatter',
            mode: 'markers',
            name: 'slope elements',
            marker: { color: '#1f77b4', size: 8 },
          },
          ...lineTraces,
        ]}
        layout={{
          title: { text: `MRC fit — R² = ${fit.rSquared.toFixed(3)}` },
          xaxis: { title: { text: `R (${headers.r})` } },
          yaxis: { title: { text: `dR/dt (${headers.r}/${headers.t})` } },
          margin: { t: 40, l: 60, r: 20, b: 50 },
          legend: { orientation: 'h' },
        }}
        config={{ displaylogo: false, responsive: true }}
        style={{ width: '100%', height: 380 }}
        useResizeHandler
      />
    </div>
  );
});
