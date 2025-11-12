/**
 * Core flow service - manages the flow state using Angular signals
 */

import { Injectable, signal, computed, effect, Signal } from '@angular/core';
import {
  Node,
  Edge,
  InternalNode,
  InternalEdge,
  NodeChange,
  EdgeChange,
  Viewport,
  Transform,
  SelectionRect,
  ConnectionState,
  Connection,
  NodeOrigin,
  CoordinateExtent,
  Handle,
  Dimensions,
  XYPosition,
  Position,
} from '../types';
import {
  applyNodeChanges,
  applyEdgeChanges,
  createNodeLookup,
  createEdgeLookup,
  createParentLookup,
  calculateAbsolutePosition,
  viewportToTransform,
} from '../utils';
import { DEFAULT_VIEWPORT, DEFAULT_NODE_ORIGIN, DEFAULT_EXTENT } from '../constants';

@Injectable()
export class FlowService {
  // ============================================================================
  // Writable Signals (Private State)
  // ============================================================================

  private readonly _nodes = signal<Node[]>([]);
  private readonly _edges = signal<Edge[]>([]);
  private readonly _viewport = signal<Viewport>(DEFAULT_VIEWPORT);
  private readonly _dimensions = signal<Dimensions>({ width: 0, height: 0 });
  private readonly _nodeOrigin = signal<NodeOrigin>(DEFAULT_NODE_ORIGIN);
  private readonly _minZoom = signal<number>(0.5);
  private readonly _maxZoom = signal<number>(2);
  private readonly _translateExtent = signal<CoordinateExtent>(DEFAULT_EXTENT);
  private readonly _nodeExtent = signal<CoordinateExtent>(DEFAULT_EXTENT);
  private readonly _selectionRect = signal<SelectionRect | null>(null);
  private readonly _connectionState = signal<ConnectionState>({
    source: '',
    target: '',
    sourceHandle: undefined,
    targetHandle: undefined,
    inProgress: false,
    isValid: false,
    from: null,
    to: null,
  });
  private readonly _nodesDraggable = signal<boolean>(true);
  private readonly _nodesConnectable = signal<boolean>(true);
  private readonly _elementsSelectable = signal<boolean>(true);
  private readonly _snapToGrid = signal<boolean>(false);
  private readonly _snapGrid = signal<[number, number]>([15, 15]);
  private readonly _nodeInternals = signal<Map<string, { handleBounds?: any; z: number }>>(
    new Map()
  );

  // ============================================================================
  // Computed Signals (Derived State)
  // ============================================================================

  /** Public read-only nodes signal */
  readonly nodes: Signal<Node[]> = this._nodes.asReadonly();

  /** Public read-only edges signal */
  readonly edges: Signal<Edge[]> = this._edges.asReadonly();

  /** Public read-only viewport signal */
  readonly viewport: Signal<Viewport> = this._viewport.asReadonly();

  /** Transform (for rendering) */
  readonly transform = computed<Transform>(() => {
    const vp = this._viewport();
    return [vp.x, vp.y, vp.zoom];
  });

  /** Internal nodes with computed properties */
  readonly internalNodes = computed<InternalNode[]>(() => {
    const nodes = this._nodes();
    const nodeOrigin = this._nodeOrigin();
    const internals = this._nodeInternals();

    return this.computeInternalNodes(nodes, nodeOrigin, internals);
  });

  /** Internal edges with computed properties */
  readonly internalEdges = computed<InternalEdge[]>(() => {
    const edges = this._edges();
    return this.computeInternalEdges(edges);
  });

  /** Node lookup map */
  readonly nodeLookup = computed<Map<string, InternalNode>>(() => {
    return createNodeLookup(this.internalNodes());
  });

  /** Edge lookup map */
  readonly edgeLookup = computed<Map<string, InternalEdge>>(() => {
    const map = new Map<string, InternalEdge>();
    for (const edge of this.internalEdges()) {
      map.set(edge.id, edge);
    }
    return map;
  });

  /** Parent-children lookup */
  readonly parentLookup = computed<Map<string, InternalNode[]>>(() => {
    return createParentLookup(this.internalNodes());
  });

  /** Selected nodes */
  readonly selectedNodes = computed<InternalNode[]>(() => {
    return this.internalNodes().filter(n => n.selected);
  });

  /** Selected edges */
  readonly selectedEdges = computed<InternalEdge[]>(() => {
    return this.internalEdges().filter(e => e.selected);
  });

  /** Visible nodes (for viewport culling) */
  readonly visibleNodes = computed<InternalNode[]>(() => {
    const nodes = this.internalNodes();
    const viewport = this._viewport();
    const dimensions = this._dimensions();

    // Simple visibility check - could be optimized with spatial indexing
    return nodes.filter(node => {
      if (node.hidden) return false;
      // For now, return all nodes. In production, implement viewport culling
      return true;
    });
  });

  /** Connection state */
  readonly connectionState: Signal<ConnectionState> =
    this._connectionState.asReadonly();

  /** Selection rectangle */
  readonly selectionRect: Signal<SelectionRect | null> =
    this._selectionRect.asReadonly();

  /** Dimensions */
  readonly dimensions: Signal<Dimensions> = this._dimensions.asReadonly();

  // ============================================================================
  // Configuration
  // ============================================================================

  readonly snapToGrid: Signal<boolean> = this._snapToGrid.asReadonly();
  readonly snapGrid: Signal<[number, number]> = this._snapGrid.asReadonly();
  readonly nodesDraggable: Signal<boolean> = this._nodesDraggable.asReadonly();
  readonly nodesConnectable: Signal<boolean> = this._nodesConnectable.asReadonly();
  readonly elementsSelectable: Signal<boolean> = this._elementsSelectable.asReadonly();
  readonly minZoom: Signal<number> = this._minZoom.asReadonly();
  readonly maxZoom: Signal<number> = this._maxZoom.asReadonly();
  readonly nodeOrigin: Signal<NodeOrigin> = this._nodeOrigin.asReadonly();
  readonly translateExtent: Signal<CoordinateExtent> = this._translateExtent.asReadonly();
  readonly nodeExtent: Signal<CoordinateExtent> = this._nodeExtent.asReadonly();

  // ============================================================================
  // Initialization
  // ============================================================================

  constructor() {}

  // ============================================================================
  // Node Management
  // ============================================================================

  setNodes(nodes: Node[]): void {
    this._nodes.set([...nodes]);
  }

  getNodes(): Node[] {
    return this._nodes();
  }

  getNode(id: string): Node | undefined {
    return this._nodes().find(n => n.id === id);
  }

  getInternalNode(id: string): InternalNode | undefined {
    return this.nodeLookup().get(id);
  }

  addNodes(nodes: Node[]): void {
    this._nodes.update(current => [...current, ...nodes]);
  }

  updateNode(id: string, updates: Partial<Node>): void {
    this._nodes.update(current =>
      current.map(node => (node.id === id ? { ...node, ...updates } : node))
    );
  }

  updateNodeData(id: string, data: any): void {
    this.updateNode(id, { data });
  }

  deleteNode(id: string): void {
    this._nodes.update(current => current.filter(n => n.id !== id));
    // Also remove connected edges
    this._edges.update(current =>
      current.filter(e => e.source !== id && e.target !== id)
    );
  }

  deleteNodes(ids: string[]): void {
    const idSet = new Set(ids);
    this._nodes.update(current => current.filter(n => !idSet.has(n.id)));
    // Also remove connected edges
    this._edges.update(current =>
      current.filter(e => !idSet.has(e.source) && !idSet.has(e.target))
    );
  }

  applyNodeChanges(changes: NodeChange[]): void {
    this._nodes.update(current => applyNodeChanges(changes, current));
  }

  // ============================================================================
  // Edge Management
  // ============================================================================

  setEdges(edges: Edge[]): void {
    this._edges.set([...edges]);
  }

  getEdges(): Edge[] {
    return this._edges();
  }

  getEdge(id: string): Edge | undefined {
    return this._edges().find(e => e.id === id);
  }

  getInternalEdge(id: string): InternalEdge | undefined {
    return this.edgeLookup().get(id);
  }

  addEdges(edges: Edge[]): void {
    this._edges.update(current => [...current, ...edges]);
  }

  updateEdge(id: string, updates: Partial<Edge>): void {
    this._edges.update(current =>
      current.map(edge => (edge.id === id ? { ...edge, ...updates } : edge))
    );
  }

  updateEdgeData(id: string, data: any): void {
    this.updateEdge(id, { data });
  }

  deleteEdge(id: string): void {
    this._edges.update(current => current.filter(e => e.id !== id));
  }

  deleteEdges(ids: string[]): void {
    const idSet = new Set(ids);
    this._edges.update(current => current.filter(e => !idSet.has(e.id)));
  }

  applyEdgeChanges(changes: EdgeChange[]): void {
    this._edges.update(current => applyEdgeChanges(changes, current));
  }

  // ============================================================================
  // Viewport Management
  // ============================================================================

  setViewport(viewport: Viewport): void {
    this._viewport.set({ ...viewport });
  }

  getViewport(): Viewport {
    return this._viewport();
  }

  setDimensions(dimensions: Dimensions): void {
    this._dimensions.set(dimensions);
  }

  getDimensions(): Dimensions {
    return this._dimensions();
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  setNodeOrigin(nodeOrigin: NodeOrigin): void {
    this._nodeOrigin.set(nodeOrigin);
  }

  setMinZoom(minZoom: number): void {
    this._minZoom.set(minZoom);
  }

  setMaxZoom(maxZoom: number): void {
    this._maxZoom.set(maxZoom);
  }

  setTranslateExtent(extent: CoordinateExtent): void {
    this._translateExtent.set(extent);
  }

  setNodeExtent(extent: CoordinateExtent): void {
    this._nodeExtent.set(extent);
  }

  setSnapToGrid(snap: boolean): void {
    this._snapToGrid.set(snap);
  }

  setSnapGrid(grid: [number, number]): void {
    this._snapGrid.set(grid);
  }

  setNodesDraggable(draggable: boolean): void {
    this._nodesDraggable.set(draggable);
  }

  setNodesConnectable(connectable: boolean): void {
    this._nodesConnectable.set(connectable);
  }

  setElementsSelectable(selectable: boolean): void {
    this._elementsSelectable.set(selectable);
  }

  // ============================================================================
  // Selection
  // ============================================================================

  setSelectionRect(rect: SelectionRect | null): void {
    this._selectionRect.set(rect);
  }

  // ============================================================================
  // Connection
  // ============================================================================

  setConnectionState(state: Partial<ConnectionState>): void {
    this._connectionState.update(current => ({ ...current, ...state }));
  }

  resetConnectionState(): void {
    this._connectionState.set({
      source: '',
      target: '',
      sourceHandle: undefined,
      targetHandle: undefined,
      inProgress: false,
      isValid: false,
      from: null,
      to: null,
    });
  }

  // ============================================================================
  // Node Internals (for handle bounds, z-index, etc.)
  // ============================================================================

  updateNodeInternals(
    nodeId: string,
    internals: { handleBounds?: any; z?: number }
  ): void {
    this._nodeInternals.update(current => {
      const newMap = new Map(current);
      const existing = newMap.get(nodeId) || { z: 0 };
      newMap.set(nodeId, { ...existing, ...internals });
      return newMap;
    });
  }

  getNodeInternals(nodeId: string): { handleBounds?: any; z: number } | undefined {
    return this._nodeInternals().get(nodeId);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private computeInternalNodes(
    nodes: Node[],
    nodeOrigin: NodeOrigin,
    internals: Map<string, any>
  ): InternalNode[] {
    const nodeLookup = new Map<string, InternalNode>();
    const internalNodes: InternalNode[] = [];

    // First pass: create internal nodes
    for (const node of nodes) {
      const nodeInternals = internals.get(node.id) || { z: 0 };

      const internalNode: InternalNode = {
        ...node,
        measured: {
          width: node.width || 0,
          height: node.height || 0,
        },
        positionAbsolute: { ...node.position },
        internals: {
          handleBounds: nodeInternals.handleBounds,
          z: nodeInternals.z,
        },
      };

      nodeLookup.set(node.id, internalNode);
      internalNodes.push(internalNode);
    }

    // Second pass: calculate absolute positions
    for (const node of internalNodes) {
      if (node.parentId) {
        const parent = nodeLookup.get(node.parentId);
        if (parent) {
          node.positionAbsolute = calculateAbsolutePosition(
            node.position,
            parent.positionAbsolute,
            nodeOrigin,
            node.measured
          );
        }
      } else {
        // Apply node origin offset for root nodes
        const offsetX = node.measured.width * nodeOrigin[0];
        const offsetY = node.measured.height * nodeOrigin[1];
        node.positionAbsolute = {
          x: node.position.x - offsetX,
          y: node.position.y - offsetY,
        };
      }
    }

    return internalNodes;
  }

  private computeInternalEdges(edges: Edge[]): InternalEdge[] {
    return edges.map((edge, index) => ({
      ...edge,
      z: edge.zIndex ?? index,
    }));
  }
}
