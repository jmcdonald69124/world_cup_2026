import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const DEFAULT_DATA = [
  { minute: '0-5', count: 45 }, { minute: '6-10', count: 52 }, { minute: '11-15', count: 61 },
  { minute: '16-20', count: 58 }, { minute: '21-25', count: 63 }, { minute: '26-30', count: 70 },
  { minute: '31-35', count: 72 }, { minute: '36-40', count: 75 }, { minute: '41-45', count: 88 },
  { minute: '45+', count: 55 }, { minute: '46-50', count: 64 }, { minute: '51-55', count: 69 },
  { minute: '56-60', count: 73 }, { minute: '61-65', count: 78 }, { minute: '66-70', count: 80 },
  { minute: '71-75', count: 82 }, { minute: '76-80', count: 85 }, { minute: '81-85', count: 90 },
  { minute: '86-90', count: 95 }, { minute: '90+', count: 68 },
];

export default function GoalDistribution({ data }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const chartData = data || DEFAULT_DATA;

  useEffect(() => {
    if (!svgRef.current) return;
    const margin = { top: 20, right: 20, bottom: 50, left: 45 };
    const width = svgRef.current.parentElement?.clientWidth || 500;
    const height = 220;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleBand().domain(chartData.map(d => d.minute)).range([0, innerWidth]).padding(0.1);
    const yScale = d3.scaleLinear().domain([0, d3.max(chartData, d => d.count) * 1.1]).range([innerHeight, 0]);
    yScale.ticks(5).forEach((t) => {
      g.append('line').attr('x1', 0).attr('x2', innerWidth).attr('y1', yScale(t)).attr('y2', yScale(t)).attr('stroke', '#1f2937').attr('stroke-width', 1);
      g.append('text').attr('x', -8).attr('y', yScale(t)).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('fill', '#6B7280').attr('font-size', '10px').text(t);
    });
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient').attr('id', 'goalBarGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#FFD700').attr('stop-opacity', 0.9);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#00A550').attr('stop-opacity', 0.7);
    const tooltip = d3.select(tooltipRef.current);
    g.selectAll('.bar').data(chartData).enter().append('rect').attr('class', 'bar')
      .attr('x', d => xScale(d.minute)).attr('y', innerHeight).attr('width', xScale.bandwidth()).attr('height', 0)
      .attr('fill', 'url(#goalBarGradient)').attr('rx', 2).style('cursor', 'pointer')
      .on('mouseover', function(e, d) { d3.select(this).attr('opacity', 0.75); tooltip.style('opacity', 1).html(`<strong>${d.minute} min</strong><br/>${d.count} goals`).style('left', `${e.offsetX + 10}px`).style('top', `${e.offsetY - 30}px`); })
      .on('mouseout', function() { d3.select(this).attr('opacity', 1); tooltip.style('opacity', 0); })
      .transition().duration(800).delay((_, i) => i * 30).ease(d3.easeBackOut.overshoot(0.5))
      .attr('y', d => yScale(d.count)).attr('height', d => innerHeight - yScale(d.count));
    chartData.forEach((d, i) => { if (i % 2 === 0) { g.append('text').attr('x', xScale(d.minute) + xScale.bandwidth() / 2).attr('y', innerHeight + 15).attr('text-anchor', 'middle').attr('fill', '#6B7280').attr('font-size', '9px').text(d.minute); } });
    g.append('text').attr('x', innerWidth / 2).attr('y', innerHeight + 38).attr('text-anchor', 'middle').attr('fill', '#4B5563').attr('font-size', '11px').text('Match Minute');
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerHeight / 2).attr('y', -35).attr('text-anchor', 'middle').attr('fill', '#4B5563').attr('font-size', '11px').text('Goals Scored');
    const htBand = xScale('46-50');
    if (htBand !== undefined) {
      g.append('line').attr('x1', htBand - 4).attr('y1', 0).attr('x2', htBand - 4).attr('y2', innerHeight).attr('stroke', '#374151').attr('stroke-width', 2).attr('stroke-dasharray', '4,4');
      g.append('text').attr('x', htBand - 8).attr('y', 10).attr('text-anchor', 'end').attr('fill', '#4B5563').attr('font-size', '9px').text('HT');
    }
  }, [chartData]);

  return (<div className="relative w-full"><svg ref={svgRef} className="w-full" style={{ height: '220px' }} /><div ref={tooltipRef} className="d3-tooltip" style={{ opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} /></div>);
}
