import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function MatchTimeline({ events = [], currentMinute = 0, homeTeam = 'Home', awayTeam = 'Away' }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const margin = { top: 40, right: 20, bottom: 30, left: 20 };
    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 160;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const centerY = innerHeight / 2;
    const maxMinute = Math.max(90, currentMinute + 5);
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3.scaleLinear().domain([0, maxMinute]).range([0, innerWidth]);
    g.append('line').attr('x1', 0).attr('y1', centerY).attr('x2', innerWidth).attr('y2', centerY).attr('stroke', '#374151').attr('stroke-width', 2);
    g.append('line').attr('x1', xScale(45)).attr('y1', centerY - 15).attr('x2', xScale(45)).attr('y2', centerY + 15).attr('stroke', '#4B5563').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');
    g.append('text').attr('x', xScale(45)).attr('y', centerY + 28).attr('text-anchor', 'middle').attr('fill', '#6B7280').attr('font-size', '9px').text('HT');
    [0, 15, 30, 45, 60, 75, 90].forEach((m) => { g.append('text').attr('x', xScale(m)).attr('y', centerY + 28).attr('text-anchor', 'middle').attr('fill', '#4B5563').attr('font-size', '9px').text(m === 0 ? "0'" : m === 90 ? "90'" : `${m}'`); });
    if (currentMinute > 0) {
      g.append('line').attr('x1', 0).attr('y1', centerY).attr('x2', 0).attr('y2', centerY).attr('stroke', '#00A550').attr('stroke-width', 2).attr('opacity', 0.5).transition().duration(800).attr('x2', xScale(currentMinute));
      g.append('circle').attr('cx', xScale(currentMinute)).attr('cy', centerY).attr('r', 5).attr('fill', '#00A550').attr('opacity', 0).transition().duration(800).attr('opacity', 1);
      g.append('text').attr('x', xScale(currentMinute)).attr('y', centerY - 12).attr('text-anchor', 'middle').attr('fill', '#00A550').attr('font-size', '10px').attr('font-weight', 'bold').attr('opacity', 0).text(`${currentMinute}'`).transition().duration(800).attr('opacity', 1);
    }
    g.append('text').attr('x', -margin.left + 4).attr('y', centerY - 8).attr('fill', '#00A550').attr('font-size', '10px').attr('font-weight', 'bold').text(homeTeam.length > 10 ? homeTeam.substring(0, 10) + '…' : homeTeam);
    g.append('text').attr('x', -margin.left + 4).attr('y', centerY + 18).attr('fill', '#DA291C').attr('font-size', '10px').attr('font-weight', 'bold').text(awayTeam.length > 10 ? awayTeam.substring(0, 10) + '…' : awayTeam);
    const tooltip = d3.select(tooltipRef.current);
    events.forEach((event, idx) => {
      const ex = xScale(event.minute);
      const isHome = event.team === 'home' || event.scoredBy === 'home';
      const ey = isHome ? centerY - 25 : centerY + 25;
      let eventLabel = 'G', eventColor = '#FFD700';
      if (event.type === 'yellowCard') { eventLabel = 'Y'; eventColor = '#EAB308'; }
      if (event.type === 'redCard') { eventLabel = 'R'; eventColor = '#EF4444'; }
      g.append('line').attr('x1', ex).attr('y1', centerY).attr('x2', ex).attr('y2', isHome ? centerY - 15 : centerY + 15).attr('stroke', eventColor).attr('stroke-width', 1.5).attr('opacity', 0).transition().delay(idx * 100 + 300).duration(300).attr('opacity', 0.7);
      const evtCircle = g.append('circle').attr('cx', ex).attr('cy', ey).attr('r', 12).attr('fill', '#1f2937').attr('stroke', eventColor).attr('stroke-width', 1.5).attr('opacity', 0).style('cursor', 'pointer');
      evtCircle.transition().delay(idx * 100 + 300).duration(300).attr('opacity', 1);
      g.append('text').attr('x', ex).attr('y', ey + 4).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '10px').attr('fill', eventColor).attr('font-weight', 'bold').attr('opacity', 0).text(eventLabel).transition().delay(idx * 100 + 300).duration(300).attr('opacity', 1);
      evtCircle.on('mouseover', function (e) {
        const txt = event.type === 'goal' ? `Goal: ${event.player || ''} ${event.minute}'${event.assist ? ` (${event.assist})` : ''}` : event.type === 'yellowCard' ? `Yellow: ${event.player} ${event.minute}'` : `Red: ${event.player} ${event.minute}'`;
        tooltip.style('opacity', 1).html(txt).style('left', `${e.offsetX + 10}px`).style('top', `${e.offsetY - 30}px`);
      }).on('mouseout', function () { tooltip.style('opacity', 0); });
    });
  }, [events, currentMinute, homeTeam, awayTeam]);

  return (<div className="relative w-full"><svg ref={svgRef} className="w-full" style={{ height: '160px' }} /><div ref={tooltipRef} className="d3-tooltip" style={{ opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} /></div>);
}
