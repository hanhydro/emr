# Water Table Fluctuation — MRC + EMR

Browser-based implementation of the USGS
[MRCfit + EMR workflow](https://wwwrcamnl.wr.usgs.gov/uzf/EMR.2019.update/EMR.method.html)
(Nimmo & Perkins, 2018) for estimating episodic groundwater recharge from
water-table and precipitation time series.

All computation runs client-side — nothing is uploaded. Deploys as a static
site to GitHub Pages.

## Develop

```sh
npm install
npm run dev      # dev server at http://localhost:5173/emr/
npm test         # run math-core unit tests
npm run build    # static bundle → dist/
```

## Input format

CSV with three columns in this order:

| column | meaning | original USGS name |
| --- | --- | --- |
| time | continuous single-unit scale (h or d) | `T` |
| water level | height above sea level, or depth below surface (negative) | `R` / `E` |
| cumulative precipitation | from a chosen reference time | `P` |

Put units in the header (e.g. `t (d), E (m), P (mm)`) so the app labels plots
and downloads correctly. A small synthetic `public/sample-data.csv` ships for
first-run exploration.


## Flow

1. **Upload** — drop a CSV or load the sample.
2. **MRC fit** — tune acceptance criteria for recession slope elements, fit
   `dR/dt = a + b·R` (optionally 2-segment) to obtain the master recession curve.
3. **EMR** — set `Sy` (specific yield), `Fd` (fluctuation tolerance), and
   `tLag` (lag time) to identify recharge episodes and compute `Sy · Δh` per
   episode.
4. **Results** — summary + download episodes CSV, time-series CSV, per-plot
   PNGs, or a one-click PDF report.

## Reference

Nimmo, J.R., & Perkins, K.S. (2018). Episodic Master Recession Evaluation of
Groundwater and Streamflow Hydrographs for Water-Resource Estimation.
*Vadose Zone Journal*, 17, 180050. <https://doi.org/10.2136/vzj2018.03.0050>
