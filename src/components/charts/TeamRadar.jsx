import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const AXES = ['Attack', 'Defense', 'Possession', 'Pace', 'Set Pieces', 'Experience'];

export default function TeamRadar({ teamA, teamB, statsA, statsB }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !statsA || !statsB) return;

    const size = Math.min(svgRef.current.parentElement?.clientWidth || 340, 340);
    const margin = 60;
    const radius = (size - margin * 2) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const levels = 5;
    const total = AXES.length;
    const angleSlice = (Math.PI * 2) / total;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Background circles (levels)
    for (let l = 1; l <= levels; l++) {
      const r = (radius / levels) * l;
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 1);
    }

    // Axis lines
    AXES.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke', '#374151')
        .attr('stroke-width', 1);
    });

    // Axis labels
    AXES.forEach((label, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelR = radius + 22;
      const lx = labelR * Math.cos(angle);
      const ly = labelR * Math.sin(angle);

      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text(label);
    });

    // Helper: build polygon points from stats array (values 0-100)
    const buildPath = (stats) => {
      return stats.map((val, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (val / 100) * radius;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });
    };

    const valuesA = AXES.map((ax) => statsA[ax.toLowerCase().replace(' ', '')] || 50);
    const valuesB = AXES.map((ax) => statsB[ax.toLowerCase().replace(' ', '')] || 50);

    const pointsA = buildPath(valuesA);
    const pointsB = buildPath(valuesB);

    const lineGen = d3.line().curve(d3.curveLinearClosed);

    // Team B polygon
    const pathB = g.append('path')
      .datum(pointsB)
      .attr('d', lineGen)
      .attr('fill', teamB?.primaryColor || '#DA291C')
      .attr('fill-opacity', 0.2)
      .attr('stroke', teamB?.primaryColor || '#DA291C')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.9)
      .attr('opacity', 0);

    pathB.transition().duration(700).attr('opacity', 1);

    // Team A polygon
    const pathA = g.append('path')
      .datum(pointsA)
      .attr('d', lineGen)
      .attr('fill', teamA?.primaryColor || '#00A550')
      .attr('fill-opacity', 0.25)
      .attr('stroke', teamA?.primaryColor || '#00A550')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.9)
      .attr('opacity', 0);

    pathA.transition().duration(700).delay(200).attr('opacity', 1);

    // Dot markers on vertices for Team A
    pointsA.forEach(([px, py], i) => {
      g.append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 4)
        .attr('fill', teamA?.primaryColor || '#00A550')
        .attr('stroke', '#0a0a0f')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0)
        .transition().delay(800 + i * 50).duration(200)
        .attr('opacity', 1);
    });

    pointsB.forEach(([px, py], i) => {
      g.append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 4)
        .attr('fill', teamB?.primaryColor || '#DA291C')
        .attr('stroke', '#0a0a0f')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0)
        .transition().delay(600 + i * 50).duration(200)
        .attr('opacity', 1);
    });

  }, [teamA, teamB, statsA, statsB]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full" style={{ maxHeight: '340px' }} />
      {teamA && teamB && (
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: teamA.primaryColor || '#00A550' }} />
            <span className="text-xs text-gray-400">{teamA.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: teamB.primaryColor || '#DA291C' }} />
            <span className="text-xs text-gray-400">{teamB.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
