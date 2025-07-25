// desktop/src/renderer/components/CodeVisualization.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import * as d3 from 'd3';
import { ForceGraph3D } from 'react-force-graph';

interface Node {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'module';
  size: number;
  color: string;
}

interface Link {
  source: string;
  target: string;
  type: 'import' | 'extends' | 'calls';
  strength: number;
}

export function CodeVisualization({ projectPath }: { projectPath: string }) {
  const [viewType, setViewType] = useState<'dependency' | 'architecture' | 'complexity'>('dependency');
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] });
  const [zoom, setZoom] = useState(1);
  const graphRef = useRef<any>();

  useEffect(() => {
    loadVisualizationData();
  }, [projectPath, viewType]);

  const loadVisualizationData = async () => {
    try {
      const result = await window.api.weaver.execute('analyze', [
        projectPath,
        '--type', viewType,
        '--format', 'json'
      ]);
      
      const data = JSON.parse(result);
      setGraphData(data);
    } catch (error) {
      console.error('Failed to load visualization data:', error);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleExport = () => {
    // Export visualization as image
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${viewType}-visualization.png`;
      a.click();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Code Visualization</CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dependency">Dependencies</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-24"
              />
              <Button size="icon" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <Button size="icon" variant="outline">
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button size="icon" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="h-full w-full">
          {viewType === 'dependency' && (
            <ForceGraph3D
              ref={graphRef}
              graphData={graphData}
              nodeAutoColorBy="type"
              nodeLabel="name"
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.25}
              backgroundColor="#000000"
              nodeRelSize={6}
              linkWidth={link => link.strength}
              onNodeClick={(node: any) => {
                // Handle node click - open file
                window.api.file.open(node.id);
              }}
            />
          )}
          
          {viewType === 'architecture' && (
            <ArchitectureView data={graphData} zoom={zoom} />
          )}
          
          {viewType === 'complexity' && (
            <ComplexityHeatmap data={graphData} zoom={zoom} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Architecture Layered View
function ArchitectureView({ data, zoom }: { data: any, zoom: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Group nodes by layer
    const layers = d3.group(data.nodes, (d: Node) => d.type);
    const layerHeight = height / layers.size;

    // Create layer backgrounds
    let layerIndex = 0;
    layers.forEach((nodes, layerName) => {
      svg.append("rect")
        .attr("x", 0)
        .attr("y", layerIndex * layerHeight)
        .attr("width", width)
        .attr("height", layerHeight)
        .attr("fill", ["#1a1a1a", "#2a2a2a", "#3a3a3a"][layerIndex % 3])
        .attr("opacity", 0.5);

      svg.append("text")
        .attr("x", 10)
        .attr("y", layerIndex * layerHeight + 20)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(layerName.toUpperCase());

      layerIndex++;
    });

    // Position nodes
    const simulation = d3.forceSimulation(data.nodes)
      .force("x", d3.forceX((d: any) => {
        const layerNodes = layers.get(d.type) || [];
        const index = layerNodes.indexOf(d);
        return (index + 1) * width / (layerNodes.length + 1);
      }).strength(1))
      .force("y", d3.forceY((d: any) => {
        const layerIdx = Array.from(layers.keys()).indexOf(d.type);
        return layerIdx * layerHeight + layerHeight / 2;
      }).strength(1))
      .force("collision", d3.forceCollide().radius(30));

    // Draw links
    const linkGroup = svg.append("g");
    const links = linkGroup.selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#666")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => Math.sqrt(d.strength));

    // Draw nodes
    const nodeGroup = svg.append("g");
    const nodes = nodeGroup.selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", (d: Node) => Math.sqrt(d.size) * 5)
      .attr("fill", (d: Node) => d.color)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add labels
    const labels = nodeGroup.selectAll("text")
      .data(data.nodes)
      .enter().append("text")
      .text((d: Node) => d.name)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dy", -15);

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Apply zoom
    svg.attr("transform", `scale(${zoom})`);

  }, [data, zoom]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: '#0a0a0a' }}
    />
  );
}

// Complexity Heatmap
function ComplexityHeatmap({ data, zoom }: { data: any, zoom: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.nodes.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Create grid
    const gridSize = Math.ceil(Math.sqrt(data.nodes.length));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Sort nodes by complexity
    const sortedNodes = [...data.nodes].sort((a, b) => b.size - a.size);

    // Draw heatmap
    sortedNodes.forEach((node, index) => {
      const x = (index % gridSize) * cellWidth;
      const y = Math.floor(index / gridSize) * cellHeight;
      
      // Color based on complexity
      const intensity = node.size / 100; // Normalize to 0-1
      const hue = (1 - intensity) * 120; // Red to green
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
      
      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, x + cellWidth / 2, y + cellHeight / 2);
      
      // Draw complexity value
      ctx.font = '8px Arial';
      ctx.fillText(node.size.toString(), x + cellWidth / 2, y + cellHeight / 2 + 10);
    });

    // Apply zoom
    ctx.scale(zoom, zoom);

  }, [data, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}