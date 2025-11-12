/**
 * Core types for NgxFlow - Angular port of xyflow
 */

// ============================================================================
// Basic Types
// ============================================================================

export interface XYPosition {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rect extends XYPosition, Dimensions {}

export interface Box extends XYPosition {
  x2: number;
  y2: number;
}

export type Transform = [number, number, number]; // [x, y, zoom]

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// ============================================================================
// Position Types
// ============================================================================

export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

export type NodeOrigin = [number, number]; // [0,0] = top-left, [0.5,0.5] = center

// ============================================================================
// Node Types
// ============================================================================

export interface Node<T = any, K extends string = string> {
  id: string;
  type?: K;
  position: XYPosition;
  data: T;
  selected?: boolean;
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  dragHandle?: string;
  width?: number;
  height?: number;
  parentId?: string;
  zIndex?: number;
  extent?: 'parent' | CoordinateExtent;
  expandParent?: boolean;
  ariaLabel?: string;
  hidden?: boolean;
  style?: any;
  class?: string;
}

export interface InternalNode<T = any, K extends string = string> extends Node<T, K> {
  measured: Dimensions;
  internals: NodeInternals;
  positionAbsolute: XYPosition;
  dragging?: boolean;
}

export interface NodeInternals {
  handleBounds?: NodeHandleBounds;
  z: number;
}

export interface NodeHandleBounds {
  source: Handle[] | null;
  target: Handle[] | null;
}

export interface Handle {
  id?: string;
  nodeId: string;
  type: 'source' | 'target';
  position: Position;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CoordinateExtent = [[number, number], [number, number]];

// ============================================================================
// Edge Types
// ============================================================================

export interface Edge<T = any, K extends string = string> {
  id: string;
  type?: K;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: T;
  selected?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  animated?: boolean;
  hidden?: boolean;
  label?: string;
  labelStyle?: any;
  labelShowBg?: boolean;
  labelBgStyle?: any;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  style?: any;
  class?: string;
  markerStart?: EdgeMarker | string;
  markerEnd?: EdgeMarker | string;
  zIndex?: number;
  ariaLabel?: string;
  interactionWidth?: number;
  pathOptions?: PathOptions;
}

export interface InternalEdge<T = any, K extends string = string> extends Edge<T, K> {
  z: number;
}

export interface EdgeMarker {
  type: MarkerType;
  color?: string;
  width?: number;
  height?: number;
  markerUnits?: string;
  orient?: string;
  strokeWidth?: number;
}

export enum MarkerType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}

export interface PathOptions {
  offset?: number;
  borderRadius?: number;
  curvature?: number;
}

// ============================================================================
// Connection Types
// ============================================================================

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface HandleConnection {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
}

export type ConnectionMode = 'strict' | 'loose';

export interface ConnectionState extends Connection {
  inProgress: boolean;
  isValid: boolean;
  from: XYPosition | null;
  to: XYPosition | null;
  fromNode?: InternalNode;
  fromHandle?: Handle;
  toNode?: InternalNode;
  toHandle?: Handle;
}

// ============================================================================
// Selection Types
// ============================================================================

export interface SelectionRect extends Rect {
  startX: number;
  startY: number;
  draw: boolean;
}

// ============================================================================
// Change Types
// ============================================================================

export type NodeChange =
  | NodeDimensionChange
  | NodePositionChange
  | NodeSelectionChange
  | NodeRemoveChange
  | NodeAddChange
  | NodeReplaceChange
  | NodeResetChange;

export interface NodeDimensionChange {
  type: 'dimensions';
  id: string;
  dimensions: Dimensions;
  handleBounds?: NodeHandleBounds;
  resizing?: boolean;
}

export interface NodePositionChange {
  type: 'position';
  id: string;
  position?: XYPosition;
  positionAbsolute?: XYPosition;
  dragging?: boolean;
}

export interface NodeSelectionChange {
  type: 'select';
  id: string;
  selected: boolean;
}

export interface NodeRemoveChange {
  type: 'remove';
  id: string;
}

export interface NodeAddChange {
  type: 'add';
  item: Node;
}

export interface NodeReplaceChange {
  type: 'replace';
  id: string;
  item: Node;
}

export interface NodeResetChange {
  type: 'reset';
  items: Node[];
}

export type EdgeChange =
  | EdgeSelectionChange
  | EdgeRemoveChange
  | EdgeAddChange
  | EdgeReplaceChange
  | EdgeResetChange;

export interface EdgeSelectionChange {
  type: 'select';
  id: string;
  selected: boolean;
}

export interface EdgeRemoveChange {
  type: 'remove';
  id: string;
}

export interface EdgeAddChange {
  type: 'add';
  item: Edge;
}

export interface EdgeReplaceChange {
  type: 'replace';
  id: string;
  item: Edge;
}

export interface EdgeResetChange {
  type: 'reset';
  items: Edge[];
}

// ============================================================================
// Event Types
// ============================================================================

export interface NodeMouseEvent {
  event: MouseEvent;
  node: InternalNode;
}

export interface EdgeMouseEvent {
  event: MouseEvent;
  edge: InternalEdge;
}

export interface ConnectionEvent {
  event: MouseEvent;
  connection: Connection;
}

export interface SelectionDragEvent {
  event: MouseEvent;
  nodes: InternalNode[];
}

// ============================================================================
// Callback Types
// ============================================================================

export type OnNodesChange = (changes: NodeChange[]) => void;
export type OnEdgesChange = (changes: EdgeChange[]) => void;
export type OnConnect = (connection: Connection) => void;
export type OnConnectStart = (event: MouseEvent, handle: Handle) => void;
export type OnConnectEnd = (event: MouseEvent | TouchEvent) => void;
export type OnNodeClick = (event: NodeMouseEvent) => void;
export type OnNodeDoubleClick = (event: NodeMouseEvent) => void;
export type OnNodeMouseEnter = (event: NodeMouseEvent) => void;
export type OnNodeMouseMove = (event: NodeMouseEvent) => void;
export type OnNodeMouseLeave = (event: NodeMouseEvent) => void;
export type OnNodeDrag = (event: NodeMouseEvent) => void;
export type OnNodeDragStart = (event: NodeMouseEvent) => void;
export type OnNodeDragStop = (event: NodeMouseEvent) => void;
export type OnEdgeClick = (event: EdgeMouseEvent) => void;
export type OnEdgeDoubleClick = (event: EdgeMouseEvent) => void;
export type OnEdgeMouseEnter = (event: EdgeMouseEvent) => void;
export type OnEdgeMouseMove = (event: EdgeMouseEvent) => void;
export type OnEdgeMouseLeave = (event: EdgeMouseEvent) => void;
export type OnSelectionDrag = (event: SelectionDragEvent) => void;
export type OnSelectionDragStart = (event: SelectionDragEvent) => void;
export type OnSelectionDragStop = (event: SelectionDragEvent) => void;
export type OnPaneClick = (event: MouseEvent) => void;
export type OnPaneScroll = (event: WheelEvent) => void;
export type OnPaneContextMenu = (event: MouseEvent) => void;
export type IsValidConnection = (connection: Connection) => boolean;

// ============================================================================
// Pan/Zoom Types
// ============================================================================

export interface PanZoomOptions {
  duration?: number;
}

export interface FitViewOptions extends PanZoomOptions {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  nodes?: { id: string }[];
}

export interface ViewportHelpers {
  zoomIn: (options?: PanZoomOptions) => Promise<boolean>;
  zoomOut: (options?: PanZoomOptions) => Promise<boolean>;
  zoomTo: (zoom: number, options?: PanZoomOptions) => Promise<boolean>;
  setViewport: (viewport: Viewport, options?: PanZoomOptions) => Promise<boolean>;
  getViewport: () => Viewport;
  fitView: (options?: FitViewOptions) => Promise<boolean>;
  setCenter: (x: number, y: number, options?: PanZoomOptions) => Promise<boolean>;
  fitBounds: (bounds: Rect, options?: PanZoomOptions) => Promise<boolean>;
  project: (position: XYPosition) => XYPosition;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  flowToScreenPosition: (position: XYPosition) => XYPosition;
}

// ============================================================================
// Node/Edge Helpers
// ============================================================================

export interface NodeHelpers {
  addNodes: (nodes: Node[]) => void;
  setNodes: (nodes: Node[]) => void;
  getNodes: () => Node[];
  getNode: (id: string) => Node | undefined;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  updateNode: (id: string, nodeUpdate: Partial<Node>) => void;
  updateNodeData: (id: string, dataUpdate: Partial<any>) => void;
}

export interface EdgeHelpers {
  addEdges: (edges: Edge[]) => void;
  setEdges: (edges: Edge[]) => void;
  getEdges: () => Edge[];
  getEdge: (id: string) => Edge | undefined;
  deleteEdge: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
  updateEdge: (id: string, edgeUpdate: Partial<Edge>) => void;
  updateEdgeData: (id: string, dataUpdate: Partial<any>) => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface NgFlowProps {
  nodes?: Node[];
  edges?: Edge[];
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  onConnectStart?: OnConnectStart;
  onConnectEnd?: OnConnectEnd;
  onNodeClick?: OnNodeClick;
  onNodeDoubleClick?: OnNodeDoubleClick;
  onNodeMouseEnter?: OnNodeMouseEnter;
  onNodeMouseMove?: OnNodeMouseMove;
  onNodeMouseLeave?: OnNodeMouseLeave;
  onNodeDrag?: OnNodeDrag;
  onNodeDragStart?: OnNodeDragStart;
  onNodeDragStop?: OnNodeDragStop;
  onEdgeClick?: OnEdgeClick;
  onEdgeDoubleClick?: OnEdgeDoubleClick;
  onEdgeMouseEnter?: OnEdgeMouseEnter;
  onEdgeMouseMove?: OnEdgeMouseMove;
  onEdgeMouseLeave?: OnEdgeMouseLeave;
  onPaneClick?: OnPaneClick;
  onPaneScroll?: OnPaneScroll;
  onPaneContextMenu?: OnPaneContextMenu;
  isValidConnection?: IsValidConnection;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  nodesFocusable?: boolean;
  edgesFocusable?: boolean;
  elementsSelectable?: boolean;
  selectNodesOnDrag?: boolean;
  panOnDrag?: boolean | number[];
  minZoom?: number;
  maxZoom?: number;
  defaultViewport?: Viewport;
  translateExtent?: CoordinateExtent;
  nodeExtent?: CoordinateExtent;
  nodeOrigin?: NodeOrigin;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  connectionMode?: ConnectionMode;
  connectOnClick?: boolean;
  connectionRadius?: number;
  deleteKeyCode?: string | string[];
  selectionKeyCode?: string | string[];
  multiSelectionKeyCode?: string | string[];
  zoomActivationKeyCode?: string | string[];
  panActivationKeyCode?: string | string[];
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: 'free' | 'vertical' | 'horizontal';
  zoomOnDoubleClick?: boolean;
  selectionOnDrag?: boolean;
  selectionMode?: 'partial' | 'full';
  preventScrolling?: boolean;
  elevateNodesOnSelect?: boolean;
  elevateEdgesOnSelect?: boolean;
  autoPanOnConnect?: boolean;
  autoPanOnNodeDrag?: boolean;
  connectionLineType?: string;
  connectionLineStyle?: any;
  ariaLiveMessage?: string;
}

export interface NodeProps<T = any> {
  id: string;
  type: string;
  data: T;
  position: XYPosition;
  positionAbsolute: XYPosition;
  selected: boolean;
  dragging: boolean;
  draggable: boolean;
  selectable: boolean;
  connectable: boolean;
  deletable: boolean;
  width?: number;
  height?: number;
  zIndex: number;
  isConnectable: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  hidden?: boolean;
}

export interface EdgeProps<T = any> {
  id: string;
  type: string;
  data?: T;
  source: string;
  target: string;
  sourceHandleId?: string;
  targetHandleId?: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  selected: boolean;
  animated: boolean;
  label?: string;
  labelStyle?: any;
  labelShowBg?: boolean;
  labelBgStyle?: any;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  style?: any;
  markerStart?: string;
  markerEnd?: string;
  pathOptions?: PathOptions;
  interactionWidth?: number;
}

export interface HandleProps {
  id?: string;
  type: 'source' | 'target';
  position: Position;
  isConnectable?: boolean;
  isConnectableStart?: boolean;
  isConnectableEnd?: boolean;
  isValidConnection?: IsValidConnection;
  onConnect?: OnConnect;
}

// ============================================================================
// Background Types
// ============================================================================

export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
  Cross = 'cross',
}

export interface BackgroundProps {
  variant?: BackgroundVariant;
  gap?: number | [number, number];
  size?: number;
  color?: string;
  style?: any;
  class?: string;
}

// ============================================================================
// Minimap Types
// ============================================================================

export interface MinimapProps {
  nodeColor?: string | ((node: Node) => string);
  nodeStrokeColor?: string | ((node: Node) => string);
  nodeClass?: string | ((node: Node) => string);
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  maskColor?: string;
  maskStrokeColor?: string;
  maskStrokeWidth?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: any;
  class?: string;
  ariaLabel?: string;
  pannable?: boolean;
  zoomable?: boolean;
  inversePan?: boolean;
  zoomStep?: number;
  offsetScale?: number;
}

// ============================================================================
// Controls Types
// ============================================================================

export interface ControlsProps {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: any;
  class?: string;
  ariaLabel?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onInteractiveChange?: (interactiveStatus: boolean) => void;
}
