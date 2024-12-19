import * as d3 from 'd3';
import { SimulationNode } from '../../types';

export const setupSimulation = (nodes: SimulationNode[], width: number, height: number) => {
  return d3.forceSimulation<SimulationNode>(nodes)
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('charge', d3.forceManyBody().strength(5))
    .force('collide', d3.forceCollide<SimulationNode>().radius(d => Math.sqrt(d.market_cap / 1e8) + 30));
};