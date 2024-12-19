import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CryptoData, TimeRange } from '../types';
import { BubbleTooltip } from './BubbleTooltip';
import { filterCryptoData } from '../utils/filterUtils';
import { getPriceChange } from '../utils/priceUtils';

interface Props {
  data: CryptoData[];
  timeRange: TimeRange;
  marketCapRange: number;
  searchTerm: string;
}

interface SimulationNode extends d3.SimulationNodeDatum {
  market_cap: number;
  x?: number;
  y?: number;
}

export const BubbleView: React.FC<Props> = ({
  data,
  timeRange,
  marketCapRange,
  searchTerm,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    data: CryptoData;
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const filteredData = filterCryptoData(data, marketCapRange, searchTerm);
    const width = window.innerWidth;
    const height = window.innerHeight - 100;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Create simulation nodes with proper typing
    const nodes: SimulationNode[] = filteredData.map(d => ({
      ...d,
      market_cap: d.market_cap
    }));

    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(5))
      .force('collide', d3.forceCollide<SimulationNode>().radius(d => Math.sqrt(d.market_cap / 1e8) + 30));

    // Add nodes to the visualization
    const bubbles = g.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'bubble cursor-pointer')
      .on('mouseover', (event, d) => {
        if (!isDragging) {
          setTooltipData({
            data: d as unknown as CryptoData,
            x: event.pageX,
            y: event.pageY
          });
        }
      })
      .on('mouseout', () => setTooltipData(null))
      .call(d3.drag<any, SimulationNode>()
        .on('start', (event) => {
          setIsDragging(true);
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          setIsDragging(false);
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    // Add circles
    bubbles.append('circle')
      .attr('r', d => Math.sqrt(d.market_cap / 1e8) + 30)
      .attr('fill', d => getPriceChange(d as unknown as CryptoData, timeRange) > 0 ? '#4CAF50' : '#F44336')
      .attr('stroke', '#2d3748')
      .attr('stroke-width', 2);

    // Add labels
    bubbles.append('text')
      .text(d => (d as unknown as CryptoData).symbol.toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px');

    simulation.on('tick', () => {
      bubbles.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, timeRange, marketCapRange, searchTerm, isDragging]);

  return (
    <div className="relative">
      <svg 
        ref={svgRef} 
        className="w-full h-[calc(100vh-120px)] bg-gray-900"
      />
      {tooltipData && !isDragging && (
        <BubbleTooltip
          data={tooltipData.data}
          x={tooltipData.x}
          y={tooltipData.y}
        />
      )}
    </div>
  );
};