import { useMemo, useRef, useState } from 'react';
import { ParamField } from '../components/ParamField';
import { MrcFitPane } from '../components/MrcFitPane';
import { fitMrc, findSlopeElements } from '../core/mrc';
import { useStore } from '../state/store';

export function MrcStage() {
  const { rows, headers, mrcParams, setMrcParams, setMrc, mrc, setStage } = useStore();
  const [err, setErr] = useState<string | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const rExtent = useMemo(() => {
    if (!rows) return { min: 0, max: 0 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of rows) {
      if (row.r < lo) lo = row.r;
      if (row.r > hi) hi = row.r;
    }
    return { min: lo, max: hi };
  }, [rows]);

  if (!rows || !headers) return null;

  const effectiveRMin = Number.isFinite(mrcParams.rMin) ? mrcParams.rMin : rExtent.min;
  const effectiveRMax = Number.isFinite(mrcParams.rMax) ? mrcParams.rMax : rExtent.max;

  function runFit() {
    try {
      const elems = findSlopeElements(rows!, {
        ...mrcParams,
        rMin: effectiveRMin,
        rMax: effectiveRMax,
      });
      if (elems.length < 2) {
        throw new Error(
          `Only ${elems.length} slope element(s) accepted — loosen parameters (e.g. smaller tSincePrecip, larger slopeMax, wider Rmin/Rmax).`,
        );
      }
      const fit = fitMrc(elems, mrcParams.twoSegment);
      setMrc(fit);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setMrc(null);
    }
  }

  return (
    <section className="stage">
      <h2>2. Fit the Master Recession Curve (MRC)</h2>
      <p>
        MRC models the baseline recession <em>dR/dt = a + b·R</em> from intervals with no
        infiltration. Tune the acceptance criteria, then fit.
      </p>
      <div className="params-grid">
        <ParamField
          symbol="Rmin"
          name="response lower limit"
          help="Minimum water level allowed as the starting point of a recession slope element."
          value={effectiveRMin}
          step={0.01}
          onChange={(v) => setMrcParams({ rMin: v })}
        />
        <ParamField
          symbol="Rmax"
          name="response upper limit"
          help="Maximum water level allowed as the starting point of a slope element."
          value={effectiveRMax}
          step={0.01}
          onChange={(v) => setMrcParams({ rMax: v })}
        />
        <ParamField
          symbol="tSincePrecip"
          name="min time since last precip"
          help="Minimum time (same units as t) between the last significant precipitation and the start of a slope element."
          value={mrcParams.tSincePrecip}
          step={0.1}
          onChange={(v) => setMrcParams({ tSincePrecip: v })}
        />
        <ParamField
          symbol="Pnegligible"
          name="negligible precipitation"
          help="Largest incremental precipitation still treated as zero within a slope element."
          value={mrcParams.pNegligible}
          step={0.01}
          onChange={(v) => setMrcParams({ pNegligible: v })}
        />
        <ParamField
          symbol="slopeMax"
          name="max allowable |dR/dt|"
          help="Steepest recession magnitude accepted as part of the MRC."
          value={mrcParams.slopeMax}
          step={0.01}
          onChange={(v) => setMrcParams({ slopeMax: v })}
        />
        <ParamField
          symbol="minLen"
          name="min element duration"
          help="Minimum duration (same units as t) of a slope element."
          value={mrcParams.minElementLen}
          step={0.1}
          onChange={(v) => setMrcParams({ minElementLen: v })}
        />
        <ParamField
          symbol="maxLen"
          name="max element duration"
          help="Maximum duration (same units as t) of a slope element."
          value={mrcParams.maxElementLen}
          step={0.1}
          onChange={(v) => setMrcParams({ maxElementLen: v })}
        />
        <label className="param checkbox">
          <input
            type="checkbox"
            checked={mrcParams.twoSegment}
            onChange={(e) => setMrcParams({ twoSegment: e.target.checked })}
          />
          <span>
            <strong>2-segment</strong> (piecewise-linear MRC with best-fit breakpoint R*)
          </span>
        </label>
      </div>
      <div className="actions">
        <button onClick={runFit}>Fit MRC</button>
        <button onClick={() => setStage('upload')}>Back</button>
        {mrc && <button onClick={() => setStage('emr')}>Continue to EMR →</button>}
      </div>
      {err && <div className="error">{err}</div>}
      {mrc && <MrcFitPane ref={paneRef} fit={mrc} headers={headers} />}
    </section>
  );
}
