"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  Position,
  Handle,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Link from "next/link"
import { ExternalLink, Package, GitBranch, MoveHorizontal, X } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import type { DependencyNode, DependencyTreeResult } from "@/types/npm"

// Edge colors
const EDGE_COLOR_PRIMARY = "#60a5fa" // blue-400
const EDGE_COLOR_SECONDARY = "#9ca3af" // gray-400

// Layout constants
const NODE_WIDTH = 140
const MIN_X_SPACING = 160
const Y_SPACING = 180

interface DependencyGraphProps {
  dependencyTree: DependencyTreeResult
  packageName: string
  className?: string
}

// Custom node component for dependencies
function DependencyNodeComponent({ data }: { data: { label: string; version: string; isRoot: boolean; depth: number } }) {
  const { label, version, isRoot, depth } = data

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-xl border shadow-lg transition-all relative w-35",
        "hover:shadow-xl hover:scale-105",
        isRoot
          ? "bg-primary/20 border-primary text-primary-foreground"
          : depth === 1
          ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          : depth === 2
          ? "bg-zinc-50 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600"
          : "bg-zinc-100 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-500"
      )}
    >
      {/* Target handles */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />
      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />
      {/* Source handles */}
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        style={{ background: "transparent", border: "none", width: 1, height: 1 }}
      />

      <div className="flex items-center gap-2 mb-1">
        <Package className={cn("h-3.5 w-3.5 shrink-0", isRoot ? "text-primary" : "text-zinc-600 dark:text-zinc-200")} />
        <span className={cn("font-mono font-bold text-xs wrap-break-word leading-tight", isRoot ? "text-primary" : "text-zinc-800 dark:text-white")}>
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-xs font-mono", isRoot ? "text-primary/80" : "text-zinc-500 dark:text-zinc-300")}>{version}</span>
        <div className="flex items-center gap-1">
          <Link
            href={`/package/${encodeURIComponent(label)}`}
            className="p-1 rounded hover:bg-primary/10 text-zinc-500 dark:text-zinc-300 hover:text-primary transition-colors"
            title="View stats"
            onClick={(e) => e.stopPropagation()}
          >
            <GitBranch className="h-3 w-3" />
          </Link>
          <a
            href={`https://www.npmjs.com/package/${encodeURIComponent(label)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-primary/10 text-zinc-500 dark:text-zinc-300 hover:text-primary transition-colors"
            title="View on npm"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  dependency: DependencyNodeComponent,
}

interface TreeNode {
  name: string
  version: string
  children: TreeNode[]
  width: number // calculated width of subtree
  x: number
  y: number
}

// Convert dependency tree to React Flow nodes and edges with proper layout
function treeToNodesAndEdges(
  tree: DependencyTreeResult
): { nodes: Node[]; edges: Edge[] } {
  // Track all unique nodes and edges (for shared deps)
  const nodePositions = new Map<string, { x: number; y: number; depth: number }>()
  const allEdges: { source: string; target: string; depth: number }[] = []
  const processedNodes = new Set<string>()

  // Build tree structure, tracking shared deps
  function buildTree(node: DependencyNode, depth: number, parentName?: string): TreeNode | null {
    const isAlreadyProcessed = processedNodes.has(node.name)
    
    // Always add edge if there's a parent
    if (parentName) {
      allEdges.push({ source: parentName, target: node.name, depth })
    }

    // If already processed, don't create duplicate tree node
    if (isAlreadyProcessed) {
      return null
    }
    processedNodes.add(node.name)

    const children: TreeNode[] = []
    if (node.dependencies) {
      for (const child of node.dependencies) {
        const childNode = buildTree(child, depth + 1, node.name)
        if (childNode) {
          children.push(childNode)
        }
      }
    }

    return {
      name: node.name,
      version: node.version,
      children,
      width: 0,
      x: 0,
      y: depth * Y_SPACING,
    }
  }

  const rootTree = buildTree(tree.root, 0)
  if (!rootTree) {
    return { nodes: [], edges: [] }
  }

  // Calculate width of each subtree (bottom-up)
  function calculateWidth(node: TreeNode): number {
    if (node.children.length === 0) {
      node.width = MIN_X_SPACING
      return node.width
    }

    let totalChildWidth = 0
    for (const child of node.children) {
      totalChildWidth += calculateWidth(child)
    }

    // Node width is max of: min spacing, or total children width
    node.width = Math.max(MIN_X_SPACING, totalChildWidth)
    return node.width
  }

  calculateWidth(rootTree)

  // Position nodes (top-down), centering children under parent
  function positionNodes(node: TreeNode, leftBound: number) {
    // Center this node within its allocated width
    node.x = leftBound + node.width / 2

    // Store position for React Flow
    nodePositions.set(node.name, { x: node.x, y: node.y, depth: node.y / Y_SPACING })

    // Position children
    let childLeft = leftBound
    for (const child of node.children) {
      positionNodes(child, childLeft)
      childLeft += child.width
    }
  }

  // Start positioning from center (root at x=0)
  positionNodes(rootTree, -rootTree.width / 2)

  // Create React Flow nodes
  const nodes: Node[] = []
  nodePositions.forEach((pos, name) => {
    // Find the node data
    const findNode = (n: DependencyNode): DependencyNode | null => {
      if (n.name === name) return n
      if (n.dependencies) {
        for (const child of n.dependencies) {
          const found = findNode(child)
          if (found) return found
        }
      }
      return null
    }
    const nodeData = findNode(tree.root)
    if (!nodeData) return

    const depth = pos.depth

    nodes.push({
      id: `node-${name}`,
      type: "dependency",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y },
      data: {
        label: name,
        version: nodeData.version,
        isRoot: depth === 0,
        depth,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    })
  })

  // Create React Flow edges
  const edges: Edge[] = allEdges.map((edge, index) => {
    const isDirectDep = edge.depth === 1
    const sourcePos = nodePositions.get(edge.source)
    const targetPos = nodePositions.get(edge.target)
    
    // Determine edge direction
    const isUpward = sourcePos && targetPos && sourcePos.y > targetPos.y
    const isSameLevel = sourcePos && targetPos && sourcePos.y === targetPos.y
    
    // Determine handles based on edge direction:
    // - Normal downward: bottom -> top
    // - Upward: top -> bottom  
    // - Same level: bottom -> bottom (curves down and back up)
    let sourceHandle = "source-bottom"
    let targetHandle = "target-top"
    
    if (isSameLevel) {
      sourceHandle = "source-bottom"
      targetHandle = "target-bottom"
    } else if (isUpward) {
      sourceHandle = "source-top"
      targetHandle = "target-bottom"
    }
    
    return {
      id: `edge-${index}-${edge.source}-${edge.target}`,
      source: `node-${edge.source}`,
      target: `node-${edge.target}`,
      sourceHandle,
      targetHandle,
      type: "default",
      style: {
        stroke: isDirectDep ? EDGE_COLOR_PRIMARY : EDGE_COLOR_SECONDARY,
        strokeWidth: isDirectDep ? 2 : 1.5,
      },
    }
  })

  return { nodes, edges }
}

export function DependencyGraph({ dependencyTree, packageName, className }: DependencyGraphProps) {
  const { resolvedTheme } = useTheme()
  const { nodes, edges } = useMemo(
    () => treeToNodesAndEdges(dependencyTree),
    [dependencyTree]
  )

  const directDeps = dependencyTree.root.dependencies?.length || 0
  const uniquePackages = nodes.length
  const [showHint, setShowHint] = useState(true)

  // Get container width for centering - start with 0 to delay render until measured
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  // Calculate initial viewport to center root node
  const initialViewport = useMemo(() => {
    const zoom = 0.9
    // Root is at graph x=0, we want it centered in container
    const x = containerWidth / 2
    const y = 30
    return { x, y, zoom }
  }, [containerWidth])

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Dependency Graph
            </h3>
            <p className="text-sm text-muted-foreground">
              {directDeps} direct {directDeps === 1 ? "dependency" : "dependencies"} &middot;{" "}
              {uniquePackages - 1} unique packages
            </p>
          </div>
          <div className="flex flex-row flex-wrap gap-3 text-xs text-foreground/70">
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-primary/20 border border-primary" />
              Root
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
              Direct
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600" />
              Transitive
            </span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="relative h-80 sm:h-125 w-full">
        {/* Pan/zoom hint - dismissable */}
        {showHint && directDeps > 0 && (
          <button
            onClick={() => setShowHint(false)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/90 border border-border/50 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10 shadow-lg"
          >
            <MoveHorizontal className="h-3.5 w-3.5" />
            <span>Drag to pan, scroll to zoom</span>
            <X className="h-3 w-3 ml-1 opacity-50" />
          </button>
        )}
        
        {directDeps > 0 && containerWidth > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            defaultViewport={initialViewport}
            minZoom={0.1}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className={resolvedTheme === "dark" ? "dark" : ""}
          >
            <Background color="#374151" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="bg-card/80! border-border/50! rounded-lg! shadow-lg!"
            />
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No dependencies</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {packageName} has no production dependencies
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
