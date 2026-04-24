import { useState, type ChangeEvent } from 'react';
import { parseCsv } from '../core/csv';
import { labelsFor } from '../core/labels';
import { useStore } from '../state/store';
import type { DataType } from '../state/store';

export function UploadStage() {
  const setData = useStore((s) => s.setData);
  const dataType = useStore((s) => s.dataType);
  const setDataType = useStore((s) => s.setDataType);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const labels = labelsFor(dataType);

  async function loadText(text: string, name: string) {
    try {
      const { rows, headers } = parseCsv(text);
      setData(rows, headers, name);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    const text = await f.text();
    await loadText(text, f.name);
    setLoading(false);
  }

  async function loadSample() {
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL ?? '/';
      const res = await fetch(`${base}sample-data.csv`);
      const text = await res.text();
      await loadText(text, 'sample-data.csv');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stage">
      <h2>1. Upload data</h2>
      <fieldset className="type-picker">
        <legend>Data type</legend>
        {(['WT', 'Q'] as DataType[]).map((t) => {
          const tl = labelsFor(t);
          return (
            <label key={t} className={dataType === t ? 'selected' : ''}>
              <input
                type="radio"
                name="dataType"
                value={t}
                checked={dataType === t}
                onChange={() => setDataType(t)}
              />
              <span>
                <strong>{t}</strong> — {tl.rName}
                {t === 'WT' && <em> (recharge = Sy · Δh)</em>}
                {t === 'Q' && <em> (output is Δh in discharge; Sy not used)</em>}
              </span>
            </label>
          );
        })}
      </fieldset>
      <p>
        CSV with three columns: <em>time</em>, <em>{labels.rName} ({labels.rAxisFallback})</em>,
        and <em>cumulative precipitation (P)</em>. Time must be on a continuous single-unit
        scale (e.g. hours or days). Put the units in the header — example:{' '}
        <code>{labels.exampleHeader}</code>.
      </p>
      <div className="upload-row">
        <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={loading} />
        <button onClick={loadSample} disabled={loading}>
          Try sample data
        </button>
      </div>
      {error && <div className="error">Error: {error}</div>}
    </section>
  );
}
