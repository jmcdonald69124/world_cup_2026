import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { buildProbabilityHistory } from '../../utils/bayesian.js';

export default function ProbabilityHistory({ events = [], initialProbs, homeTeam = 'Home', awayTeam = 'Away', currentMinute = 90 }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !initialProbs) return;

    const margin = { top: 20, right: 100, bottom: 40, left: 45 };
    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 260;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Build history data
    const historyData = buildProbabilityHistory(initialProbs, events, currentMinute);

    const xScale = d3.scaleLinear().domain([0, Math.max(90, currentMinute)]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    // Grid lines
    const yTicks = [0.25, 0.5, 0.75, 1.0];
    yTicks.forEach((t) => {
      g.append('line')
        .attr('x1', 0).attr('x2', innerWidth)
        .attr('y1', yScale(t)).attr('y2', yScale(t))
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', -8)
        .attr('y', yScale(t))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6B7280')
        .attr('font-size', '10px')
        .text(`${Math.round(t * 100)}%`);
    });

    // Axes
    g.append('line')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', innerWidth).attr('y2', innerHeight)
      .attr('stroke', '#374151').attr('stroke-width', 1);

    [0, 15, 30, 45, 60, 75, 90].forEach((m) => {
      g.append('text')
        .attr('x', xScale(m))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6B7280')
        .attr('font-size', '10px')
        .text(`${m}'`);
    });

    // Halftime line
    g.append('line')
      .attr('x1', xScale(45)).attr('y1', 0)
      .attr('x2', xScale(45)).attr('y2', innerHeight)
      .attr('stroke', '#374151')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    const lineConfigs = [
      { key: 'home', color: '#00A550', label: homeTeam },
      { key: 'draw', color: '#6B7280', label: 'Draw' },
      { key: 'away', color: '#DA291C', label: awayTeam },
    ];

    lineConfigs.forEach(({ key, color }) => {
      // Area fill
      const area = d3.area()
        .x(d => xScale(d.minute))
        .y0(innerHeight)
        .y1(d => yScale(d[key]))
        .curve(d3.curveCatmullRom.alpha(0.5));

      g.append('path')
        .datum(historyData)
        .attr('fill', color)
        .attr('opacity', 0.08)
        .attr('d', area);

      // Line
      const line = d3.line()
        .x(d => xScale(d.minute))
        .y(d => yScale(d[key]))
        .curve(d3.curveCatmullRom.alpha(0.5));

      const path = g.append('path')
        .datum(historyData)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Animate line drawing
      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(1200).ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
    });

    // Goal event dots with tooltips
    const goalEvents = events.filter(e => e.type === 'goal');
    const tooltip = d3.select(tooltipRef.current);

    goalEvents.forEach((event) => {
      const probAtEvent = historyData.find(d => Math.abs(d.minute - event.minute) < 1);
      if (!probAtEvent) return;

      const isHome = event.scoredBy === 'home';
      const probKey = isHome ? 'home' : 'away';
      const color = isHome ? '#00A550' : '#DA291C';

      const dot = g.append('circle')
        .attr('cx', xScale(event.minute))
        .attr('cy', yScale(probAtEvent[probKey]))
        .attr('r', 5)
        .attr('fill', color)
        .attr('stroke', '#0a0a0f')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .attr('opacity', 0)
        .transition().delay(1100).duration(300)
        .attr('opacity', 1);

      // Vertical event line
      g.append('line')
        .attr('x1', xScale(event.minute))
        .attr('y1', 0)
        .attr('x2', xScale(event.minute))
        .attr('y2', innerHeight)
        .attr('stroke', color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.4);

      g.append('text')
        .attr('x', xScale(event.minute))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('opacity', 0)
        .text('⚽')
        .transition().delay(1100).duration(300)
        .attr('opacity', 1);
    });

    // Legend
    lineConfigs.forEach(({ color, label }, i) => {
      const ly = 10 + i * 22;
      svg.append('line')
        .attr('x1', width - margin.right + 8)
        .attr('y1', margin.top + ly)
        .attr('x2', width - margin.right + 26)
        .attr('y2', margin.top + ly)
        .attr('stroke', color)
        .attr('stroke-width', 2.5);

      svg.append('text')
        .attr('x', width - margin.right + 30)
        .attr('y', margin.top + ly)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '10px')
        .text(label.length > 10 ? label.substring(0, 10) + '…' : label);
    });

  }, [events, initialProbs, homeTeam, awayTeam, currentMinute]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full" style={{ height: '260px' }} />
      <div
        ref={tooltipRef}
        className="d3-tooltip"
        style={{ opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}
      />
    </div>
  );
}
