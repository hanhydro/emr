import { useRef } from 'react';
import { HydrographPane } from '../components/HydrographPane';
import { MrcFitPane } from '../components/MrcFitPane';
import { EpisodesPane } from '../components/EpisodesPane';
import { SummaryTable } from '../components/SummaryTable';
import {
  downloadText,
  episodesToCsv,
  seriesToCsv,
  downloadPng,
  downloadPdfReport,
} from '../core/download';
import { useStore } from '../state/store';

export function ResultsStage() {
  const { rows, headers, mrc, mrcParams, emrParams, result, setStage } = useStore();
  const hydroRef = useRef<HTMLDivElement>(null);
  const mrcRef = useRef<HTMLDivElement>(null);
  const episodesRef = useRef<HTMLDivElement>(null);

  if (!rows || !headers || !mrc || !result) return null;

  return (
    <section className="stage">
      <h2>4. Results</h2>
      <SummaryTable result={result} headers={headers} />
      <div className="actions">
        <button onClick={() => downloadText('episodes.csv', episodesToCsv(result.episodes, headers), 'text/csv')}>
          Download episodes CSV
        </button>
        <button onClick={() => downloadText('series.csv', seriesToCsv(rows, headers), 'text/csv')}>
          Download time-series CSV
        </button>
        <button onClick={() => downloadPng(hydroRef.current, 'hydrograph.png')}>
          Hydrograph PNG
        </button>
        <button onClick={() => downloadPng(mrcRef.current, 'mrc-fit.png')}>MRC fit PNG</button>
        <button onClick={() => downloadPng(episodesRef.current, 'episodes.png')}>
          Episodes PNG
        </button>
        <button
          onClick={() =>
            downloadPdfReport({
              plotDivs: [hydroRef.current, mrcRef.current, episodesRef.current],
              result,
              mrc,
              headers,
              mrcParams,
              emrParams,
            })
          }
        >
          Download PDF report
        </button>
        <button onClick={() => setStage('emr')}>← Back to EMR</button>
      </div>
      <HydrographPane ref={hydroRef} rows={rows} headers={headers} episodes={result.episodes} />
      <MrcFitPane ref={mrcRef} fit={mrc} headers={headers} />
      <EpisodesPane ref={episodesRef} episodes={result.episodes} headers={headers} />
    </section>
  );
}
