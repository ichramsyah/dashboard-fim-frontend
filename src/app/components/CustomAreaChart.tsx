// app/components/CustomAreaChart.tsx
'use client';

import React, { useMemo } from 'react';
// --- DIUBAH: Impor Line, bukan LinePath ---
import { AreaClosed } from '@visx/shape';
import { line as d3Line } from 'd3-shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { LinearGradient } from '@visx/gradient';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { localPoint } from '@visx/event';
import { motion } from 'framer-motion';

// ... (Interface dan margin tidak berubah) ...
interface HistoricalData {
  tanggal: string;
  detail: { bahaya: number; mencurigakan: number; normal: number };
}
type ChartProps = {
  data: HistoricalData[];
  width: number;
  height: number;
  onDateSelect: (date: string) => void;
};
const margin = { top: 20, right: 30, bottom: 40, left: 40 };

// ... (Aksesor data tidak berubah) ...
const getDate = (d: HistoricalData) => new Date(d.tanggal);
const getBahayaValue = (d: HistoricalData) => d.detail.bahaya;
const getMencurigakanValue = (d: HistoricalData) => d.detail.mencurigakan;
const getNormalValue = (d: HistoricalData) => d.detail.normal;

export default function CustomAreaChart({ data, width, height, onDateSelect }: ChartProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // --- DIUBAH: Perhitungan skala dan string path digabung di useMemo ---
  const { timeScale, valueScale, pathBahaya, pathMencurigakan, pathNormal } = useMemo(() => {
    const timeScale = scaleTime({
      range: [0, innerWidth],
      domain: [Math.min(...data.map((d) => getDate(d).getTime())), Math.max(...data.map((d) => getDate(d).getTime()))],
    });

    const maxValue = Math.max(...data.map((d) => Math.max(getBahayaValue(d), getMencurigakanValue(d), getNormalValue(d))));

    const valueScale = scaleLinear({
      range: [innerHeight, 0],
      domain: [0, maxValue + maxValue * 0.1],
      nice: true,
    });
    // --- BARU: Buat generator string path ---
    // Definisikan fungsi generator menggunakan d3-shape
    const lineGenerator = (getValue: (d: HistoricalData) => number) =>
      d3Line<HistoricalData>()
        .x((d) => timeScale(getDate(d)))
        .y((d) => valueScale(getValue(d)));

    // Buat string path-nya
    const pathBahaya = lineGenerator(getBahayaValue)(data) || '';
    const pathMencurigakan = lineGenerator(getMencurigakanValue)(data) || '';
    const pathNormal = lineGenerator(getNormalValue)(data) || '';
    // --- ---------------------------- ---
    // --- ---------------------------- ---

    return { timeScale, valueScale, pathBahaya, pathMencurigakan, pathNormal };
  }, [data, innerWidth, innerHeight]);
  // --- ----------------------------------------------------------- ---

  // ... (Fungsi handleDateClick tidak berubah) ...
  const handleDateClick = (event: React.MouseEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (!point) return;
    const x = point.x - margin.left;
    const xDate = timeScale.invert(x);
    const closest = data.reduce((prev, curr) => {
      const prevDate = getDate(prev);
      const currDate = getDate(curr);
      return Math.abs(currDate.getTime() - xDate.getTime()) < Math.abs(prevDate.getTime() - xDate.getTime()) ? curr : prev;
    });
    onDateSelect(closest.tanggal);
  };

  if (width < 10) return null;

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        {/* ... (Definisi gradien, grid, dan sumbu tidak berubah) ... */}
        <rect x={0} y={0} width={width} height={height} fill="#ffffff" rx={14} />
        <LinearGradient id="grad-bahaya" from="#f48c8c" to="#f48c8c" toOpacity={0.1} />
        <LinearGradient id="grad-mencurigakan" from="#f0ce95" to="#f0ce95" toOpacity={0.1} />
        <LinearGradient id="grad-normal" from="#a3c3f8" to="#a3c3f8" toOpacity={0.1} />

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <GridRows scale={valueScale} width={innerWidth} stroke="#e0e0e0" strokeDasharray="2,5" />
          <AxisLeft
            scale={valueScale}
            stroke="#888"
            tickStroke="#888"
            tickLabelProps={() => ({
              fill: '#888',
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
            })}
          />
          <AxisBottom
            top={innerHeight}
            scale={timeScale}
            stroke="#888"
            tickStroke="#888"
            tickLabelProps={() => ({
              fill: '#888',
              fontSize: 11,
              textAnchor: 'middle',
            })}
            tickFormat={(date) => {
              if (!(date instanceof Date)) return '';
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />

          {/* ... (AreaClosed tidak berubah) ... */}
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getBahayaValue(d))} yScale={valueScale} fill="url(#grad-bahaya)" stroke="none" />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getMencurigakanValue(d))} yScale={valueScale} fill="url(#grad-mencurigakan)" stroke="none" />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getNormalValue(d))} yScale={valueScale} fill="url(#grad-normal)" stroke="none" />

          {/* --- DIUBAH: Hapus <LinePath> dan gunakan string path yang sudah dibuat --- */}
          <motion.path d={pathBahaya} fill="transparent" stroke="#f48c8c" strokeWidth={2.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
          <motion.path d={pathMencurigakan} fill="transparent" stroke="#f0ce95" strokeWidth={2.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />
          <motion.path d={pathNormal} fill="transparent" stroke="#a3c3f8" strokeWidth={2.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6 }} />
          {/* --- -------------------------------------------------------------- --- */}

          {/* ... (Area klik tidak berubah) ... */}
          <rect x={0} y={0} width={innerWidth} height={innerHeight} fill="transparent" onClick={handleDateClick} />
        </g>
      </svg>
    </div>
  );
}
