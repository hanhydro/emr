import type { Episode, Headers, RunResult } from '../core/types';

interface Props {
  result: RunResult;
  headers: Headers;
}

export function SummaryTable({ result, headers }: Props) {
  return (
    <div className="summary">
      <div className="totals">
        <div><strong>Episodes:</strong> {result.totals.count}</div>
        <div><strong>Total recharge ({headers.r}):</strong> {result.totals.recharge.toFixed(4)}</div>
        <div><strong>Matched precip ({headers.p}):</strong> {result.totals.precip.toFixed(4)}</div>
        <div><strong>Recharge / precip:</strong> {result.totals.ratio.toFixed(3)}</div>
      </div>
      <table className="episodes">
        <thead>
          <tr>
            <th>#</th>
            <th>t_start ({headers.t})</th>
            <th>t_peak ({headers.t})</th>
            <th>t_end ({headers.t})</th>
            <th>Δh ({headers.r})</th>
            <th>recharge ({headers.r})</th>
            <th>precip ({headers.p})</th>
          </tr>
        </thead>
        <tbody>
          {result.episodes.map((e: Episode) => (
            <tr key={e.index}>
              <td>{e.index + 1}</td>
              <td>{e.tStart.toFixed(2)}</td>
              <td>{e.tPeak.toFixed(2)}</td>
              <td>{e.tEnd.toFixed(2)}</td>
              <td>{e.deltaH.toFixed(3)}</td>
              <td>{e.recharge.toFixed(3)}</td>
              <td>{e.matchedPrecip.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
