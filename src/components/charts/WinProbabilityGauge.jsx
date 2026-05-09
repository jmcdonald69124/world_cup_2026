import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function WinProbabilityGauge({ homeProb, drawProb, awayProb, homeTeam, awayTeam, animating }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 400;
    const height = 240;
    const cx = width / 2;
    const cy = height - 30;
    const outerRadius = 160;
    const innerRadius = 100;
    const needleRadius = 140;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const bgArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    svg.append('path')
      .attr('d', bgArc())
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', '#1f2937');

    const total = homeProb + drawProb + awayProb;
    const h = homeProb / total;
    const dr = drawProb / total;
    const a = awayProb / total;

    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    const totalAngle = Math.PI;

    const homeEnd = startAngle + h * totalAngle;
    const drawEnd = homeEnd + dr * totalAngle;

    const segments = [
      { start: startAngle, end: homeEnd, color: '#00A550', label: `${Math.round(h * 100)}%`, team: homeTeam },
      { start: homeEnd, end: drawEnd, color: '#6B7280', label: `${Math.round(dr * 100)}%`, labelAlt: 'Draw' },
      { start: drawEnd, end: endAngle, color: '#DA291C', label: `${Math.round(a * 100)}%`, team: awayTeam },
    ];

    segments.forEach((seg) => {
      const path = svg.append('path')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', seg.color)
        .attr('opacity', 0.85);

      path.transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interp = d3.interpolate(seg.start, seg.end);
          return (t) => {
            const arcFn = d3.arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius)
              .startAngle(seg.start)
              .endAngle(interp(t))
              .padAngle(0.02)
              .cornerRadius(3);
            return arcFn();
          };
        });

      const midAngle = (seg.start + seg.end) / 2;
      const labelR = (innerRadius + outerRadius) / 2;
      const lx = cx + labelR * Math.sin(midAngle);
      const ly = cy - labelR * Math.cos(midAngle);

      if (Math.abs(seg.end - seg.start) > 0.2) {
        svg.append('text')
          .attr('x', lx)
          .attr('y', ly)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(seg.label)
          .transition().delay(700).duration(300)
          .attr('opacity', 1);
      }
    });

    const ticks = [0, 0.25, 0.5, 0.75, 1.0];
    ticks.forEach((t) => {
      const angle = startAngle + t * totalAngle;
      const x1 = cx + (outerRadius + 5) * Math.sin(angle);
      const y1 = cy - (outerRadius + 5) * Math.cos(angle);
      const x2 = cx + (outerRadius + 12) * Math.sin(angle);
      const y2 = cy - (outerRadius + 12) * Math.cos(angle);
      svg.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#374151')
        .attr('stroke-width', 1.5);
    });

    svg.append('text')
      .attr('x', cx)
      .attr('y', cy - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '11px')
      .text('Win Probability');

    svg.append('text')
      .attr('x', cx)
      .attr('y', cy + 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '26px')
      .attr('font-weight', 'bold')
      .text(`${Math.round(h * 100)}%`)
      .attr('opacity', 0)
      .transition().delay(600).duration(400)
      .attr('opacity', 1);

    const needleAngle = startAngle + h * totalAngle;
    const needleX = cx + needleRadius * Math.sin(needleAngle);
    const needleY = cy - needleRadius * Math.cos(needleAngle);

    const needleGroup = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    const needleLine = needleGroup.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('stroke', '#FFD700')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    const initialNeedleX = needleRadius * Math.sin(startAngle);
    const initialNeedleY = -needleRadius * Math.cos(startAngle);

    needleLine
      .attr('x2', initialNeedleX)
      .attr('y2', initialNeedleY)
      .transition()
      .duration(1000)
      .ease(d3.easeBounceOut)
      .attr('x2', needleX - cx)
      .attr('y2', needleY - cy);

    needleGroup.append('circle')
      .attr('r', 8)
      .attr('fill', '#FFD700')
      .attr('stroke', '#0a0a0f')
      .attr('stroke-width', 2);

    svg.append('text')
      .attr('x', cx - outerRadius - 5)
      .attr('y', cy + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#00A550')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(homeTeam || 'Home');

    svg.append('text')
      .attr('x', cx + outerRadius + 5)
      .attr('y', cy + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#DA291C')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(awayTeam || 'Away');

    svg.append('text')
      .attr('x', cx)
      .attr('y', cy + 22)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6B7280')
      .attr('font-size', '10px')
      .text(`Draw ${Math.round(dr * 100)}%`);

  }, [homeProb, drawProb, awayProb, homeTeam, awayTeam]);

  return (
    <div className="w-full max-w-md mx-auto">
      <svg ref={svgRef} className="w-full" style={{ maxHeight: '240px' }} />
    </div>
  );
}
