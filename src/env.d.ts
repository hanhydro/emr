/// <reference types="vite/client" />

declare module 'plotly.js-dist-min' {
  const Plotly: {
    toImage: (
      el: HTMLElement | { data: unknown; layout: unknown },
      opts: { format: 'png' | 'svg' | 'jpeg' | 'webp'; width?: number; height?: number },
    ) => Promise<string>;
  };
  export default Plotly;
}
