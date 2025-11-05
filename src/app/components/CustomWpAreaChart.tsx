// app/components/CustomWpAreaChart.tsx
'use client';

import React, { useMemo } from 'react';
import { AreaClosed } from '@visx/shape';
import { line as d3Line, curveMonotoneX } from 'd3-shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { LinearGradient } from '@visx/gradient';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { motion } from 'framer-motion';
import { localPoint } from '@visx/event';

interface WpTrendData {
  date: string;
  login_success: number;
  login_fail: number;
  content: number;
  plugin: number;
}

type ChartProps = {
  data: WpTrendData[];
  width: number;
  height: number;
  onDateSelect: (date: string) => void;
};

const margin = { top: 20, right: 30, bottom: 40, left: 40 };

const getDate = (d: WpTrendData) => new Date(d.date);
const getLoginFailValue = (d: WpTrendData) => d.login_fail;
const getLoginSuccessValue = (d: WpTrendData) => d.login_success;
const getContentValue = (d: WpTrendData) => d.content;
const getPluginValue = (d: WpTrendData) => d.plugin;

export default function CustomWpAreaChart({ data, width, height, onDateSelect }: ChartProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const { timeScale, valueScale, pathLoginFail, pathLoginSuccess, pathContent, pathPlugin } = useMemo(() => {
    const timeScale = scaleTime({
      range: [0, innerWidth],
      domain: [Math.min(...data.map((d) => getDate(d).getTime())), Math.max(...data.map((d) => getDate(d).getTime()))],
    });
    const maxValue = Math.max(...data.map((d) => Math.max(getLoginFailValue(d), getLoginSuccessValue(d), getContentValue(d), getPluginValue(d))));
    const valueScale = scaleLinear({
      range: [innerHeight, 0],
      domain: [0, maxValue + maxValue * 0.1],
      nice: true,
    });
    const lineGenerator = (getValue: (d: WpTrendData) => number) =>
      d3Line<WpTrendData>()
        .x((d) => timeScale(getDate(d)))
        .y((d) => valueScale(getValue(d)))
        .curve(curveMonotoneX);
    const pathLoginFail = lineGenerator(getLoginFailValue)(data) || '';
    const pathLoginSuccess = lineGenerator(getLoginSuccessValue)(data) || '';
    const pathContent = lineGenerator(getContentValue)(data) || '';
    const pathPlugin = lineGenerator(getPluginValue)(data) || '';
    return { timeScale, valueScale, pathLoginFail, pathLoginSuccess, pathContent, pathPlugin };
  }, [data, innerWidth, innerHeight]);

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
    onDateSelect(closest.date);
  };

  if (width < 10) return null;

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#0f0e0e" rx={1} />
        <LinearGradient id="grad-fail" from="#f36262ff" to="#f36262ff" toOpacity={0} />
        <LinearGradient id="grad-success" from="#3cd976ff" to="#3cd976ff" toOpacity={0} />
        <LinearGradient id="grad-content" from="#6ea3f8ff" to="#6ea3f8ff" toOpacity={0} />
        <LinearGradient id="grad-plugin" from="#f5b23eff" to="#f5b23eff" toOpacity={0} />
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <GridRows scale={valueScale} width={innerWidth} stroke="#676767ff" strokeDasharray="2,5" />
          <AxisLeft scale={valueScale} stroke="#888" tickStroke="#888" tickLabelProps={() => ({ fill: '#888', fontSize: 11, textAnchor: 'end', dy: '0.33em' })} />
          <AxisBottom
            top={innerHeight}
            scale={timeScale}
            stroke="#888"
            tickStroke="#888"
            tickLabelProps={() => ({ fill: '#888', fontSize: 11, textAnchor: 'middle' })}
            tickFormat={(date) => {
              if (!(date instanceof Date)) return '';
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getLoginFailValue(d))} yScale={valueScale} fill="url(#grad-fail)" stroke="none" curve={curveMonotoneX} />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getLoginSuccessValue(d))} yScale={valueScale} fill="url(#grad-success)" stroke="none" curve={curveMonotoneX} />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getContentValue(d))} yScale={valueScale} fill="url(#grad-content)" stroke="none" curve={curveMonotoneX} />
          <AreaClosed data={data} x={(d) => timeScale(getDate(d))} y={(d) => valueScale(getPluginValue(d))} yScale={valueScale} fill="url(#grad-plugin)" stroke="none" curve={curveMonotoneX} />
          <motion.path d={pathLoginFail} fill="transparent" stroke="#ef4444" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
          <motion.path
            d={pathLoginSuccess}
            fill="transparent"
            stroke="#22c55e"
            strokeWidth={1}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
          />
          <motion.path d={pathContent} fill="transparent" stroke="#3b82f6" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6 }} />
          <motion.path d={pathPlugin} fill="transparent" stroke="#f59e0b" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8 }} />

          <rect x={0} y={0} width={innerWidth} height={innerHeight} fill="transparent" onClick={handleDateClick} style={{ cursor: 'pointer' }} />
        </g>
      </svg>
    </div>
  );
}
