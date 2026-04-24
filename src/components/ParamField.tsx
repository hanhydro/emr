import type { ChangeEvent } from 'react';

interface Props {
  symbol: string;
  name: string;
  help: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}

export function ParamField({ symbol, name, help, value, step = 0.01, onChange }: Props) {
  return (
    <label className="param">
      <span className="param-label">
        <strong>{symbol}</strong> <span className="param-plain">({name})</span>
      </span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
        title={help}
      />
      <span className="param-help">{help}</span>
    </label>
  );
}
