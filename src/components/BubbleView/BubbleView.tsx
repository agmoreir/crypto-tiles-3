import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CryptoData, TimeRange, SimulationNode } from '../../types';
import { BubbleTooltip } from './BubbleTooltip';
import { filterCryptoData } from '../../utils/filterUtils';
import { getPriceChange } from '../../utils/priceUtils';
import { setupSimulation } from './simulation';
import { renderBubbles } from './renderBubbles';

interface Props {
  data: CryptoData[];
  timeRange: TimeRange;
  marketCapRange: number;
  searchTerm: string;
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

    const nodes: SimulationNode[] = filteredData.map(d => ({
      id: d.id,
      symbol: d.symbol,
      market_cap: d.market_cap,
    }));

    const simulation = setupSimulation(nodes, width, height);
    const bubbles = renderBubbles(g, nodes, timeRange, {
      onMouseOver: (event, d) => {
        if (!isDragging) {
          const cryptoData = filteredData.find(cd => cd.id === d.id);
          if (cryptoData) {
            setTooltipData({
              data: cryptoData,
              x: event.pageX,
              y: event.pageY
            });
          }
        }
      },
      onMouseOut: () => setTooltipData(null),
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => setIsDragging(false),
    }, simulation);

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