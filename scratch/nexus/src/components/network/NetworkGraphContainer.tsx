import React, { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  User, 
  Building2, 
  Smartphone, 
  Landmark, 
  Truck, 
  ExternalLink,
  X,
  Phone,
  Car,
  Layers
} from 'lucide-react'
import { NetworkGraphData, GraphNode, GraphEdge, EntityType } from '../../types'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

interface NetworkGraphContainerProps {
  initialData: NetworkGraphData
  height?: string
  onNodeClick?: (node: GraphNode) => void
  interactive?: boolean
}

export const NetworkGraphContainer: React.FC<NetworkGraphContainerProps> = ({
  initialData,
  height = 'h-[560px]',
  onNodeClick,
  interactive = true,
}) => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  // Viewport State
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Core 7-node presentation mode toggle
  const [showCoreOnly, setShowCoreOnly] = useState(true)

  // Selection & Hover
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)

  // Filtered Nodes: 5-8 Core Entities by default
  const displayNodes = useMemo(() => {
    if (showCoreOnly) {
      return initialData.nodes.filter(n => n.isCore)
    }
    return initialData.nodes
  }, [initialData.nodes, showCoreOnly])

  const displayNodeIds = useMemo(() => new Set(displayNodes.map(n => n.id)), [displayNodes])

  // Filtered Edges between displayed nodes
  const displayEdges = useMemo(() => {
    return initialData.edges.filter(
      (edge) => displayNodeIds.has(edge.source) && displayNodeIds.has(edge.target)
    )
  }, [initialData.edges, displayNodeIds])

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 2.0))
  }

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDraggingCanvas(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingCanvas(false)
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Helper icons and colors by entity type
  const getTypeMeta = (type: EntityType) => {
    switch (type) {
      case 'suspect':
        return { color: '#ef4444', label: 'Person', icon: User }
      case 'shell_company':
        return { color: '#f59e0b', label: 'Company', icon: Building2 }
      case 'burner_phone':
        return { color: '#00e5ff', label: 'SIM / Phone', icon: Smartphone }
      case 'bank_account':
        return { color: '#10b981', label: 'Hawala Account', icon: Landmark }
      case 'vehicle':
        return { color: '#38bdf8', label: 'Vehicle', icon: Truck }
      default:
        return { color: '#94a3b8', label: 'Entity', icon: User }
    }
  }

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>()
    displayNodes.forEach(n => map.set(n.id, n))
    return map
  }, [displayNodes])

  return (
    <div className={cn('relative w-full rounded-sm border border-slate-800 bg-[#090d16] overflow-hidden select-none', height)}>
      {/* Background Tactical Grid */}
      <div className="absolute inset-0 pointer-events-none tactical-grid opacity-50" />
      
      {/* Top Left Presentation Toolbar */}
      <div className="absolute left-3 top-3 z-10 flex items-center space-x-2">
        <div className="flex items-center space-x-1 rounded-sm border border-slate-800 bg-[#0c121e]/90 p-1 backdrop-blur-md">
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(z * 1.15, 2.0))} title="Zoom In">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(z / 1.15, 0.6))} title="Zoom Out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetView} title="Reset Center">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <span className="font-mono text-[10px] text-cyan-400 px-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Presentation Toggle: Core 7 vs All 9 */}
        <Button
          variant={showCoreOnly ? 'cyan' : 'tactical'}
          size="sm"
          onClick={() => setShowCoreOnly(!showCoreOnly)}
          className="flex items-center space-x-1.5 h-8 text-[10px]"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{showCoreOnly ? 'Core Network (7 Entities)' : 'Expanded Network (9 Entities)'}</span>
        </Button>
      </div>

      {/* Top Right SIH presentation tag */}
      <div className="absolute right-3 top-3 z-10 hidden sm:flex items-center space-x-2 rounded-sm border border-slate-800 bg-[#0c121e]/90 px-3 py-1.5 font-mono text-[10px] text-slate-400 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-300 font-bold uppercase">OPERATION CHAKRAVYUH // TOPOLOGY</span>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <svg className="w-full h-full overflow-visible">
          <g transform={`translate(${pan.x + 80}, ${pan.y + 40}) scale(${zoom})`}>
            {/* Edges */}
            {displayEdges.map((edge) => {
              const src = nodeMap.get(edge.source)
              const tgt = nodeMap.get(edge.target)
              if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return null

              const isHighlighted = 
                selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)

              const isHawala = edge.relationship === 'hawala_transfer'
              const strokeColor = isHighlighted 
                ? '#00e5ff' 
                : isHawala 
                ? '#10b981' 
                : edge.isSuspicious 
                ? '#ef4444' 
                : '#475e82'

              const midX = (src.x + tgt.x) / 2
              const midY = (src.y + tgt.y) / 2

              return (
                <g key={edge.id}>
                  {/* Glowing line for active connections */}
                  {isHighlighted && (
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="#00e5ff"
                      strokeWidth="4"
                      strokeOpacity="0.4"
                    />
                  )}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.5 : Math.max(edge.weight / 3.5, 1.5)}
                    strokeDasharray={edge.relationship === 'phone_call' ? '4 4' : undefined}
                    strokeOpacity={isHighlighted ? 1 : 0.8}
                  />

                  {/* Clear, readable Edge Label Badge */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-48"
                      y="-9"
                      width="96"
                      height="18"
                      rx="3"
                      fill="#0c121e"
                      stroke={strokeColor}
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text
                      textAnchor="middle"
                      y="3.5"
                      fill={isHawala ? '#34d399' : '#f1f5f9'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.amountINR || edge.label}
                    </text>
                  </g>
                </g>
              )
            })}

            {/* Nodes */}
            {displayNodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null

              const meta = getTypeMeta(node.type)
              const isSelected = selectedNode?.id === node.id
              const isHovered = hoveredNode?.id === node.id
              const nodeRadius = node.isHVT ? 26 : 22

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode(node)
                    if (onNodeClick) onNodeClick(node)
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer Radar Glow on Selected / HVT */}
                  {(isSelected || node.isHVT) && (
                    <circle
                      r={nodeRadius + 8}
                      fill="none"
                      stroke={meta.color}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                  )}

                  {/* Base Circle */}
                  <circle
                    r={nodeRadius}
                    fill="#0a0f1d"
                    stroke={isSelected ? '#00e5ff' : meta.color}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Threat Risk Pill Badge */}
                  <g transform={`translate(0, -${nodeRadius + 5})`}>
                    <rect
                      x="-14"
                      y="-7"
                      width="28"
                      height="13"
                      rx="2"
                      fill={node.riskScore >= 90 ? '#ef4444' : node.riskScore >= 75 ? '#f59e0b' : '#00e5ff'}
                    />
                    <text
                      textAnchor="middle"
                      y="2.5"
                      fill="#000000"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.riskScore}
                    </text>
                  </g>

                  {/* Center Node Type Abbreviation */}
                  <text
                    textAnchor="middle"
                    y="4"
                    fill={meta.color}
                    fontSize={node.isHVT ? "11" : "9.5"}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.type === 'suspect' ? 'SUS' : 
                     node.type === 'vehicle' ? 'VEH' : 
                     node.type === 'bank_account' ? 'BANK' : 'ORG'}
                  </text>

                  {/* Primary Name Label (Large & Clear) */}
                  <text
                    textAnchor="middle"
                    y={nodeRadius + 14}
                    fill={isSelected ? '#00e5ff' : '#f8fafc'}
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                  >
                    {node.label}
                  </text>

                  {/* Location or Identifier subtext */}
                  {node.city && (
                    <text
                      textAnchor="middle"
                      y={nodeRadius + 26}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                      className="select-none"
                    >
                      {node.city}
                    </text>
                  )}
                  {node.vehicleNumber && (
                    <text
                      textAnchor="middle"
                      y={nodeRadius + 26}
                      fill="#f59e0b"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="select-none"
                    >
                      {node.vehicleNumber}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details Drawer (Right Side) */}
      {selectedNode && (
        <div className="absolute right-3 bottom-3 top-14 z-20 w-80 rounded-sm border border-cyan-500/50 bg-[#0c121e]/95 p-4 shadow-2xl backdrop-blur-lg font-mono text-xs overflow-y-auto animate-in slide-in-from-right duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-bold text-cyan-400 tracking-wider">TARGET DOSSIER</span>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="rounded-xs p-1 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant={selectedNode.riskScore >= 90 ? 'critical' : 'high'}>
                  THREAT SCORE {selectedNode.riskScore}/100
                </Badge>
                <span className="text-[10px] text-slate-400 uppercase">{selectedNode.status}</span>
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-slate-100">{selectedNode.label}</h3>
              {selectedNode.city && (
                <p className="text-[10px] text-cyan-300 font-semibold mt-0.5">Location: {selectedNode.city}</p>
              )}
            </div>

            {/* Contact & Vehicle Info */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
              {selectedNode.phoneMasked && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-cyan-400" />
                    Phone:
                  </span>
                  <span className="text-slate-200 font-bold">{selectedNode.phoneMasked}</span>
                </div>
              )}
              {selectedNode.vehicleNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Car className="h-3 w-3 text-amber-400" />
                    Vehicle:
                  </span>
                  <span className="text-amber-300 font-bold">{selectedNode.vehicleNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Network Links:</span>
                <span className="text-cyan-400 font-bold">{selectedNode.degree} Connections</span>
              </div>
            </div>

            {/* Direct Connected Relationships */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Connected Vectors
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {initialData.edges
                  .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map(edge => {
                    const peerId = edge.source === selectedNode.id ? edge.target : edge.source
                    const peer = initialData.nodes.find(n => n.id === peerId)
                    return (
                      <div key={edge.id} className="p-1.5 rounded-xs bg-slate-900/90 border border-slate-800 text-[10px] flex items-center justify-between">
                        <div>
                          <div className="text-slate-200 font-semibold truncate w-36">{peer?.label}</div>
                          <div className="text-slate-400 text-[9px]">{edge.label}</div>
                        </div>
                        {edge.amountINR && (
                          <span className="text-emerald-400 font-bold">{edge.amountINR}</span>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Open Full Person Details Action */}
            <div className="pt-2">
              <Button
                variant="cyan"
                size="sm"
                className="w-full flex items-center justify-center space-x-1 h-8"
                onClick={() => {
                  if (selectedNode.id.startsWith('ent-') && !selectedNode.id.startsWith('ent-v') && !selectedNode.id.startsWith('ent-b')) {
                    navigate(`/person/${selectedNode.id}`)
                  } else {
                    navigate('/person/ent-1')
                  }
                }}
              >
                <span>View Full Person Dossier</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Legend Footer */}
      <div className="absolute left-3 bottom-3 z-10 hidden sm:flex items-center space-x-3 rounded-sm border border-slate-800/80 bg-[#0c121e]/90 px-3 py-1.5 font-mono text-[9px] text-slate-400 backdrop-blur-md">
        <span className="font-semibold text-slate-300 uppercase">Legend:</span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Suspect</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Hawala Account</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>Vehicle (FASTag)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Shell Company</span>
        </span>
      </div>
    </div>
  )
}
