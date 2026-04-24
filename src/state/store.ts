import { create } from 'zustand';
import type {
  EmrParams,
  Headers,
  MrcFit,
  MrcParams,
  Row,
  RunResult,
} from '../core/types';

export type Stage = 'upload' | 'mrc' | 'emr' | 'results';
export type DataType = 'WT' | 'Q';

interface AppState {
  stage: Stage;
  dataType: DataType;
  rows: Row[] | null;
  headers: Headers | null;
  fileName: string | null;
  mrcParams: MrcParams;
  emrParams: EmrParams;
  mrc: MrcFit | null;
  result: RunResult | null;
  setStage: (s: Stage) => void;
  setDataType: (t: DataType) => void;
  setData: (rows: Row[], headers: Headers, fileName: string) => void;
  setMrcParams: (p: Partial<MrcParams>) => void;
  setEmrParams: (p: Partial<EmrParams>) => void;
  setMrc: (fit: MrcFit | null) => void;
  setResult: (r: RunResult | null) => void;
  reset: () => void;
}

const defaultMrc: MrcParams = {
  rMin: -Infinity,
  rMax: Infinity,
  tSincePrecip: 1,
  pNegligible: 0.05,
  slopeMax: 1,
  minElementLen: 1,
  maxElementLen: 30,
  twoSegment: false,
};

const defaultEmr: EmrParams = {
  sy: 0.1,
  fd: 0.02,
  tLag: 1,
};

export const useStore = create<AppState>((set) => ({
  stage: 'upload',
  dataType: 'WT',
  rows: null,
  headers: null,
  fileName: null,
  mrcParams: defaultMrc,
  emrParams: defaultEmr,
  mrc: null,
  result: null,
  setStage: (stage) => set({ stage }),
  setDataType: (dataType) => set({ dataType }),
  setData: (rows, headers, fileName) =>
    set({ rows, headers, fileName, mrc: null, result: null, stage: 'mrc' }),
  setMrcParams: (p) =>
    set((s) => ({ mrcParams: { ...s.mrcParams, ...p } })),
  setEmrParams: (p) =>
    set((s) => ({ emrParams: { ...s.emrParams, ...p } })),
  setMrc: (fit) => set({ mrc: fit }),
  setResult: (result) => set({ result }),
  reset: () =>
    set({
      stage: 'upload',
      dataType: 'WT',
      rows: null,
      headers: null,
      fileName: null,
      mrc: null,
      result: null,
      mrcParams: defaultMrc,
      emrParams: defaultEmr,
    }),
}));
