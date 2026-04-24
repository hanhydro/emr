import { useState } from 'react';
import { ParamField } from '../components/ParamField';
import { HydrographPane } from '../components/HydrographPane';
import { EpisodesPane } from '../components/EpisodesPane';
import { computeRun } from '../core/emr';
import { useStore } from '../state/store';

export function EmrStage() {
  const { rows, headers, mrc, emrParams, setEmrParams, result, setResult, setStage } = useStore();
  const [err, setErr] = useState<string | null>(null);

  if (!rows || !headers || !mrc) return null;

  function run() {
    try {
      const r = computeRun(rows!, mrc!, emrParams);
      setResult(r);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setResult(null);
    }
  }

  return (
    <section className="stage">
      <h2>3. Identify recharge episodes (EMR)</h2>
      <p>
        Walks the hydrograph, opening an episode when <em>dE/dt</em> exceeds the
        fluctuation tolerance within <em>tLag</em> of rainfall, and closes when the
        response returns to noise level. Recharge per episode is <em>Sy · Δh</em>,
        where Δh is the MRC-projected rise at the peak.
      </p>
      <div className="params-grid">
        <ParamField
          symbol="Sy"
          name="specific yield"
          help="Specific yield of the aquifer — recharge = Sy · Δh."
          value={emrParams.sy}
          step={0.01}
          onChange={(v) => setEmrParams({ sy: v })}
        />
        <ParamField
          symbol="Fd"
          name="fluctuation tolerance"
          help="Maximum |dE/dt| considered noise rather than recharge."
          value={emrParams.fd}
          step={0.001}
          onChange={(v) => setEmrParams({ fd: v })}
        />
        <ParamField
          symbol="tLag"
          name="lag time"
          help="Typical delay between rainfall onset and the resulting water-level response."
          value={emrParams.tLag}
          step={0.1}
          onChange={(v) => setEmrParams({ tLag: v })}
        />
      </div>
      <div className="actions">
        <button onClick={run}>Run EMR</button>
        <button onClick={() => setStage('mrc')}>← Back to MRC</button>
        {result && <button onClick={() => setStage('results')}>Results & download →</button>}
      </div>
      {err && <div className="error">{err}</div>}
      {result && (
        <>
          <HydrographPane rows={rows} headers={headers} episodes={result.episodes} />
          <EpisodesPane episodes={result.episodes} headers={headers} />
        </>
      )}
    </section>
  );
}
