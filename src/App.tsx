import { UploadStage } from './stages/UploadStage';
import { MrcStage } from './stages/MrcStage';
import { EmrStage } from './stages/EmrStage';
import { ResultsStage } from './stages/ResultsStage';
import { useStore } from './state/store';
import './styles.css';

export default function App() {
  const { stage, fileName, reset } = useStore();

  return (
    <div className="app">
      <header>
        <h1>Water Table Fluctuation — MRC + EMR</h1>
        <div className="subtitle">
          Browser-based implementation of the USGS{' '}
          <a
            href="https://wwwrcamnl.wr.usgs.gov/uzf/EMR.2019.update/EMR.method.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            MRCfit + EMR
          </a>{' '}
          workflow (Nimmo &amp; Perkins, 2018).
        </div>
      </header>
      <nav className="stage-nav">
        <span className={stage === 'upload' ? 'active' : ''}>1 · Upload</span>
        <span className={stage === 'mrc' ? 'active' : ''}>2 · MRC fit</span>
        <span className={stage === 'emr' ? 'active' : ''}>3 · EMR</span>
        <span className={stage === 'results' ? 'active' : ''}>4 · Results</span>
        {fileName && (
          <button className="link" onClick={reset} title="Start over">
            reset ({fileName})
          </button>
        )}
      </nav>
      <main>
        {stage === 'upload' && <UploadStage />}
        {stage === 'mrc' && <MrcStage />}
        {stage === 'emr' && <EmrStage />}
        {stage === 'results' && <ResultsStage />}
      </main>
      <footer>
        <small>
          Method reference: Nimmo, J.R., &amp; Perkins, K.S. (2018). Episodic Master
          Recession Evaluation of Groundwater and Streamflow Hydrographs for
          Water-Resource Estimation. <em>Vadose Zone Journal</em>, 17, 180050.
        </small>
      </footer>
    </div>
  );
}
