import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { FileText, GitBranch, Eye, ZoomIn, ZoomOut, RotateCcw, Settings } from 'lucide-react'
import * as d3 from 'd3'

// Type definitions
interface Node {
  id: string
  name: string
  group: number
  size: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string | Node
  target: string | Node
  value: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface CodeFile {
  name: string
  path: string
  size: number
  type: string
  complexity: number
  dependencies: string[]
}

interface ProjectData {
  files: CodeFile[]
  dependencies: { [key: string]: string[] }
  metrics: {
    totalFiles: number
    totalLines: number
    complexity: number
    dependencies: number
  }
}

const CodeVisualization: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [viewMode, setViewMode] = useState<'dependency' | 'complexity' | 'structure'>('dependency')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState([50])
  const [isLoading, setIsLoading] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const graphRef = useRef<any>(null)

  // Mock data for demonstration
  const mockProjectData: ProjectData = {
    files: [
      { name: 'App.tsx', path: 'src/App.tsx', size: 150, type: 'component', complexity: 3, dependencies: ['React', 'Router'] },
      { name: 'utils.ts', path: 'src/lib/utils.ts', size: 80, type: 'utility', complexity: 2, dependencies: ['clsx'] },
      { name: 'Button.tsx', path: 'src/components/Button.tsx', size: 120, type: 'component', complexity: 1, dependencies: ['React'] },
      { name: 'Card.tsx', path: 'src/components/Card.tsx', size: 90, type: 'component', complexity: 1, dependencies: ['React'] },
      { name: 'api.ts', path: 'src/services/api.ts', size: 200, type: 'service', complexity: 4, dependencies: ['axios'] },
    ],
    dependencies: {
      'App.tsx': ['Button.tsx', 'Card.tsx', 'api.ts'],
      'Button.tsx': ['utils.ts'],
      'Card.tsx': ['utils.ts'],
      'api.ts': ['utils.ts'],
      'utils.ts': []
    },
    metrics: {
      totalFiles: 5,
      totalLines: 640,
      complexity: 11,
      dependencies: 8
    }
  }

  useEffect(() => {
    // Simulate loading project data
    setIsLoading(true)
    setTimeout(() => {
      setProjectData(mockProjectData)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (projectData && svgRef.current) {
      renderGraph()
    }
  }, [projectData, viewMode, zoomLevel])

  const renderGraph = () => {
    if (!projectData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    const graphData = generateGraphData()

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          container.attr('transform', event.transform)
        })

    svg.call(zoom)

    const container = svg.append('g')

    // Create simulation
    const simulation = d3.forceSimulation<Node>(graphData.nodes)
        .force('link', d3.forceLink<Node, Link>(graphData.links).id((d: Node) => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30))

    // Create links
    const link = container.append('g')
        .selectAll('line')
        .data(graphData.links)
        .join('line')
        .attr('stroke', '#64748b')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', (d: Link) => Math.sqrt(d.value))

    // Create nodes
    const node = container.append('g')
        .selectAll('circle')
        .data(graphData.nodes)
        .join('circle')
        .attr('r', (d: Node) => Math.sqrt(d.size) * 2)
        .attr('fill', (d: Node) => getNodeColor(d.group))
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, d: Node) => {
          setSelectedFile(d.id)
        })
        .call(d3.drag<SVGCircleElement, Node>()
            .on('start', function(event, d) {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', function(event, d) {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', function(event, d) {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            }) as any
        )

    // Add labels
    const label = container.append('g')
        .selectAll('text')
        .data(graphData.nodes)
        .join('text')
        .text((d: Node) => d.name)
        .attr('font-size', 12)
        .attr('font-family', 'Inter, sans-serif')
        .attr('fill', '#f1f5f9')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .style('pointer-events', 'none')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
          .attr('x1', (d: any) => (d.source as Node).x || 0)
          .attr('y1', (d: any) => (d.source as Node).y || 0)
          .attr('x2', (d: any) => (d.target as Node).x || 0)
          .attr('y2', (d: any) => (d.target as Node).y || 0)

      node
          .attr('cx', (d: Node) => d.x || 0)
          .attr('cy', (d: Node) => d.y || 0)

      label
          .attr('x', (d: Node) => d.x || 0)
          .attr('y', (d: Node) => d.y || 0)
    })

    // Store reference for external controls
    graphRef.current = { simulation, zoom, svg }
  }

  const generateGraphData = (): GraphData => {
    if (!projectData) return { nodes: [], links: [] }

    const nodes: Node[] = projectData.files.map((file, index) => ({
      id: file.name,
      name: file.name,
      group: getFileTypeGroup(file.type),
      size: viewMode === 'complexity' ? file.complexity * 10 : file.size
    }))

    const links: Link[] = []
    Object.entries(projectData.dependencies).forEach(([source, targets]) => {
      targets.forEach((target) => {
        if (nodes.find(n => n.id === source) && nodes.find(n => n.id === target)) {
          links.push({
            source,
            target,
            value: 1
          })
        }
      })
    })

    return { nodes, links }
  }

  const getFileTypeGroup = (type: string): number => {
    switch (type) {
      case 'component': return 1
      case 'utility': return 2
      case 'service': return 3
      case 'config': return 4
      default: return 0
    }
  }

  const getNodeColor = (group: number): string => {
    const colors = ['#64748b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    return colors[group] || colors[0]
  }

  const handleZoomIn = () => {
    if (graphRef.current?.svg && graphRef.current?.zoom) {
      graphRef.current.svg.transition().call(
          graphRef.current.zoom.scaleBy, 1.5
      )
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current?.svg && graphRef.current?.zoom) {
      graphRef.current.svg.transition().call(
          graphRef.current.zoom.scaleBy, 1 / 1.5
      )
    }
  }

  const handleReset = () => {
    if (graphRef.current?.svg && graphRef.current?.zoom) {
      graphRef.current.svg.transition().call(
          graphRef.current.zoom.transform,
          d3.zoomIdentity
      )
    }
  }

  const loadProject = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setProjectData(mockProjectData)
      setIsLoading(false)
    }, 1500)
  }

  if (isLoading) {
    return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kod Görselleştirme
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-400">Proje analiz ediliyor...</p>
            </div>
          </CardContent>
        </Card>
    )
  }

  if (!projectData) {
    return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kod Görselleştirme
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proje Bulunamadı</h3>
            <p className="text-slate-400 mb-6">
              Kod görselleştirmesi için bir proje yükleyin
            </p>
            <Button onClick={loadProject} className="gap-2">
              <GitBranch className="h-4 w-4" />
              Proje Yükle
            </Button>
          </CardContent>
        </Card>
    )
  }

  return (
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Görselleştirme Kontrolleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Görünüm Modu:</label>
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dependency">Bağımlılık</SelectItem>
                    <SelectItem value="complexity">Karmaşıklık</SelectItem>
                    <SelectItem value="structure">Yapı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={loadProject} variant="outline" size="sm">
                <GitBranch className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visualization */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Kod Haritası - {viewMode === 'dependency' ? 'Bağımlılık' : viewMode === 'complexity' ? 'Karmaşıklık' : 'Yapı'} Görünümü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="600"
                    viewBox="0 0 800 600"
                    className="border border-slate-700 rounded"
                >
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proje İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Toplam Dosya:</span>
                  <Badge variant="secondary">{projectData.metrics.totalFiles}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Toplam Satır:</span>
                  <Badge variant="secondary">{projectData.metrics.totalLines}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Karmaşıklık:</span>
                  <Badge variant="secondary">{projectData.metrics.complexity}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bağımlılık:</span>
                  <Badge variant="secondary">{projectData.metrics.dependencies}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* File Details */}
            {selectedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dosya Detayları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const file = projectData.files.find(f => f.name === selectedFile)
                      if (!file) return <p className="text-slate-400">Dosya bulunamadı</p>

                      return (
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-slate-400">{file.path}</p>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Boyut:</span>
                              <Badge variant="outline">{file.size} satır</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tip:</span>
                              <Badge variant="outline">{file.type}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Karmaşıklık:</span>
                              <Badge variant={file.complexity > 3 ? "destructive" : "secondary"}>
                                {file.complexity}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-slate-400 mb-2">Bağımlılıklar:</p>
                              <div className="space-y-1">
                                {file.dependencies.map((dep, index) => (
                                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                                      {dep}
                                    </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                      )
                    })()}
                  </CardContent>
                </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renk Açıklaması</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Bileşenler</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Yardımcılar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Servisler</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Konfigürasyon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}

export default CodeVisualization