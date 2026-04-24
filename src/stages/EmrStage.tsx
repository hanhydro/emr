import { useState } from 'react';
import { ParamField } from '../components/ParamField';
import { HydrographPane } from '../components/HydrographPane';
import { EpisodesPane } from '../components/EpisodesPane';
import { computeRun } from '../core/emr';
import { labelsFor } from '../core/labels';
import { useStore } from '../state/store';

export function EmrStage() {
  const { rows, headers, mrc, dataType, emrParams, setEmrParams, result, setResult, setStage } =
    useStore();
  const [err, setErr] = useState<string | null>(null);

  if (!rows || !headers || !mrc) return null;
  const labels = labelsFor(dataType);

  function run() {
    try {
      const effectiveParams = labels.showSy ? emrParams : { ...emrParams, sy: 1 };
      const r = computeRun(rows!, mrc!, effectiveParams);
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
        Walks the hydrograph, opening an episode when the rate of change exceeds the
        fluctuation tolerance within <em>tLag</em> of rainfall, and closes when the
        response returns to noise level.{' '}
        {dataType === 'WT'
          ? 'Recharge per episode is Sy · Δh, where Δh is the MRC-projected rise at the peak.'
          : 'Output per episode is Δh, the MRC-projected rise in discharge at the peak. Specific yield is not used.'}
      </p>
      <div className="params-grid">
        {labels.showSy && (
          <ParamField
            symbol="Sy"
            name="specific yield"
            help="Specific yield of the aquifer — recharge = Sy · Δh."
            value={emrParams.sy}
            step={0.01}
            onChange={(v) => setEmrParams({ sy: v })}
          />
        )}
        <ParamField
          symbol="Fd"
          name="fluctuation tolerance"
          help={`Maximum |d${labels.rAxisFallback}/dt| considered noise rather than an episode.`}
          value={emrParams.fd}
          step={0.001}
          onChange={(v) => setEmrParams({ fd: v })}
        />
        <ParamField
          symbol="tLag"
          name="lag time"
          help={`Typical delay between rainfall onset and the resulting ${labels.rName} response.`}
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
          <EpisodesPane episodes={result.episodes} headers={headers} dataType={dataType} />
        </>
      )}
    </section>
  );
}
