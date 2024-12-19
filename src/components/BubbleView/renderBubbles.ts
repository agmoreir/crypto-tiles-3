import * as d3 from 'd3';
import { SimulationNode, TimeRange } from '../../types';
import { getPriceChange } from '../../utils/priceUtils';

interface BubbleHandlers {
  onMouseOver: (event: any, d: SimulationNode) => void;
  onMouseOut: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const renderBubbles = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: SimulationNode[],
  timeRange: TimeRange,
  handlers: BubbleHandlers,
  simulation: d3.Simulation<SimulationNode, undefined>
) => {
  const bubbles = g.selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'bubble cursor-pointer')
    .on('mouseover', handlers.onMouseOver)
    .on('mouseout', handlers.onMouseOut)
    .call(d3.drag<any, SimulationNode>()
      .on('start', (event) => {
        handlers.onDragStart();
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('end', (event) => {
        handlers.onDragEnd();
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }));

  bubbles.append('circle')
    .attr('r', d => Math.sqrt(d.market_cap / 1e8) + 30)
    .attr('fill', d => getPriceChange(d as any, timeRange) > 0 ? '#4CAF50' : '#F44336')
    .attr('stroke', '#2d3748')
    .attr('stroke-width', 2);

  bubbles.append('text')
    .text(d => d.symbol.toUpperCase())
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', '12px');

  return bubbles;
};