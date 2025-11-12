# NgxFlow API Documentation

Complete API reference for NgxFlow library.

## Table of Contents

1. [Components](#components)
2. [Services](#services)
3. [Types](#types)
4. [Utilities](#utilities)
5. [Constants](#constants)

---

## Components

### NgFlowComponent

Main container component for the flow diagram.

#### Selector
```html
<ngx-flow></ngx-flow>
```

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nodes` | `Node[]` | `[]` | Controlled nodes array |
| `edges` | `Edge[]` | `[]` | Controlled edges array |
| `defaultNodes` | `Node[]` | `[]` | Uncontrolled initial nodes |
| `defaultEdges` | `Edge[]` | `[]` | Uncontrolled initial edges |
| `nodesDraggable` | `boolean` | `true` | Global draggable setting |
| `nodesConnectable` | `boolean` | `true` | Global connectable setting |
| `nodesFocusable` | `boolean` | `true` | Nodes can receive focus |
| `edgesFocusable` | `boolean` | `true` | Edges can receive focus |
| `elementsSelectable` | `boolean` | `true` | Elements can be selected |
| `selectNodesOnDrag` | `boolean` | `true` | Select nodes on drag |
| `panOnDrag` | `boolean \| number[]` | `true` | Pan on background drag |
| `minZoom` | `number` | `0.5` | Minimum zoom level |
| `maxZoom` | `number` | `2` | Maximum zoom level |
| `defaultViewport` | `Viewport` | `{x:0, y:0, zoom:1}` | Initial viewport |
| `translateExtent` | `CoordinateExtent` | `Infinity` | Pan boundaries |
| `nodeExtent` | `CoordinateExtent` | `Infinity` | Node movement boundaries |
| `nodeOrigin` | `NodeOrigin` | `[0, 0]` | Node origin point |
| `fitView` | `boolean` | `false` | Fit view on mount |
| `fitViewOptions` | `FitViewOptions` | `{}` | Fit view configuration |
| `snapToGrid` | `boolean` | `false` | Enable grid snapping |
| `snapGrid` | `[number, number]` | `[15, 15]` | Grid size |
| `connectionMode` | `'strict' \| 'loose'` | `'strict'` | Connection mode |
| `connectOnClick` | `boolean` | `true` | Connect nodes on click |
| `connectionRadius` | `number` | `20` | Connection detection radius |
| `deleteKeyCode` | `string \| string[]` | `['Backspace', 'Delete']` | Delete key |
| `selectionKeyCode` | `string \| string[]` | `['Shift']` | Selection modifier |
| `multiSelectionKeyCode` | `string \| string[]` | `['Meta', 'Control']` | Multi-select modifier |
| `zoomActivationKeyCode` | `string \| string[]` | `['Meta', 'Control']` | Zoom activation key |
| `panActivationKeyCode` | `string \| string[]` | `['Space']` | Pan activation key |
| `zoomOnScroll` | `boolean` | `true` | Zoom on scroll |
| `zoomOnPinch` | `boolean` | `true` | Zoom on pinch (touch) |
| `panOnScroll` | `boolean` | `false` | Pan on scroll |
| `panOnScrollSpeed` | `number` | `1` | Pan scroll speed |
| `panOnScrollMode` | `'free' \| 'vertical' \| 'horizontal'` | `'free'` | Pan scroll mode |
| `zoomOnDoubleClick` | `boolean` | `true` | Zoom on double click |
| `selectionOnDrag` | `boolean` | `false` | Selection rect on drag |
| `selectionMode` | `'partial' \| 'full'` | `'partial'` | Selection mode |
| `preventScrolling` | `boolean` | `true` | Prevent page scroll |
| `elevateNodesOnSelect` | `boolean` | `true` | Elevate selected nodes |
| `elevateEdgesOnSelect` | `boolean` | `false` | Elevate selected edges |
| `autoPanOnConnect` | `boolean` | `true` | Auto-pan during connection |
| `autoPanOnNodeDrag` | `boolean` | `true` | Auto-pan during node drag |
| `connectionLineType` | `string` | `'bezier'` | Connection line type |
| `connectionLineStyle` | `any` | `{}` | Connection line style |
| `showBackground` | `boolean` | `false` | Show background |
| `showMinimap` | `boolean` | `false` | Show minimap |
| `showControls` | `boolean` | `false` | Show controls |

#### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `onNodesChange` | `EventEmitter<NodeChange[]>` | Node changes |
| `onEdgesChange` | `EventEmitter<EdgeChange[]>` | Edge changes |
| `onConnect` | `EventEmitter<Connection>` | Connection created |
| `onConnectStart` | `EventEmitter<{ event: MouseEvent, handle: Handle }>` | Connection start |
| `onConnectEnd` | `EventEmitter<MouseEvent>` | Connection end |
| `onNodeClick` | `EventEmitter<NodeMouseEvent>` | Node clicked |
| `onNodeDoubleClick` | `EventEmitter<NodeMouseEvent>` | Node double-clicked |
| `onNodeMouseEnter` | `EventEmitter<NodeMouseEvent>` | Mouse enter node |
| `onNodeMouseMove` | `EventEmitter<NodeMouseEvent>` | Mouse move over node |
| `onNodeMouseLeave` | `EventEmitter<NodeMouseEvent>` | Mouse leave node |
| `onNodeDrag` | `EventEmitter<NodeMouseEvent>` | Node dragging |
| `onNodeDragStart` | `EventEmitter<NodeMouseEvent>` | Node drag start |
| `onNodeDragStop` | `EventEmitter<NodeMouseEvent>` | Node drag end |
| `onEdgeClick` | `EventEmitter<EdgeMouseEvent>` | Edge clicked |
| `onEdgeDoubleClick` | `EventEmitter<EdgeMouseEvent>` | Edge double-clicked |
| `onEdgeMouseEnter` | `EventEmitter<EdgeMouseEvent>` | Mouse enter edge |
| `onEdgeMouseMove` | `EventEmitter<EdgeMouseEvent>` | Mouse move over edge |
| `onEdgeMouseLeave` | `EventEmitter<EdgeMouseEvent>` | Mouse leave edge |
| `onPaneClick` | `EventEmitter<MouseEvent>` | Pane clicked |
| `onPaneScroll` | `EventEmitter<WheelEvent>` | Pane scrolled |
| `onPaneContextMenu` | `EventEmitter<MouseEvent>` | Pane context menu |
| `onInit` | `EventEmitter<{ viewportService, flowService }>` | Flow initialized |

### BackgroundComponent

Renders background patterns (dots, lines, or cross).

#### Selector
```html
<ngx-flow-background></ngx-flow-background>
```

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'dots' \| 'lines' \| 'cross'` | `'dots'` | Pattern type |
| `gap` | `number \| [number, number]` | `20` | Grid gap |
| `size` | `number` | `1` | Pattern size |
| `color` | `string` | `'#81818a'` | Pattern color |
| `style` | `any` | `{}` | Custom styles |
| `class` | `string` | `''` | Custom class |

### ControlsComponent

Zoom and fit view controls.

#### Selector
```html
<ngx-flow-controls></ngx-flow-controls>
```

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showZoom` | `boolean` | `true` | Show zoom buttons |
| `showFitView` | `boolean` | `true` | Show fit view button |
| `showInteractive` | `boolean` | `false` | Show interactive toggle |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Position |
| `style` | `any` | `{}` | Custom styles |
| `class` | `string` | `''` | Custom class |

#### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `zoomIn` | `EventEmitter<void>` | Zoom in clicked |
| `zoomOut` | `EventEmitter<void>` | Zoom out clicked |
| `fitView` | `EventEmitter<void>` | Fit view clicked |

### MinimapComponent

Overview minimap of the flow.

#### Selector
```html
<ngx-flow-minimap></ngx-flow-minimap>
```

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nodeColor` | `string \| ((node) => string)` | `'#e2e2e2'` | Node color |
| `nodeStrokeColor` | `string \| ((node) => string)` | `'#555'` | Node stroke color |
| `nodeClass` | `string \| ((node) => string)` | `''` | Node class |
| `nodeBorderRadius` | `number` | `2` | Node border radius |
| `nodeStrokeWidth` | `number` | `2` | Node stroke width |
| `maskColor` | `string` | `'rgba(0,0,0,0.6)'` | Viewport mask color |
| `maskStrokeColor` | `string` | `'#fff'` | Mask stroke color |
| `maskStrokeWidth` | `number` | `1` | Mask stroke width |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | Position |
| `pannable` | `boolean` | `true` | Minimap is pannable |
| `zoomable` | `boolean` | `true` | Minimap is zoomable |
| `inversePan` | `boolean` | `false` | Inverse pan |
| `zoomStep` | `number` | `10` | Zoom step |
| `offsetScale` | `number` | `1` | Offset scale |

### HandleComponent

Connection handle for nodes.

#### Selector
```html
<ngx-flow-handle></ngx-flow-handle>
```

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | `undefined` | Handle ID |
| `type` | `'source' \| 'target'` | `'source'` | Handle type |
| `position` | `Position` | `Position.Top` | Handle position |
| `isConnectable` | `boolean` | `true` | Is connectable |
| `isConnectableStart` | `boolean` | `true` | Can start connection |
| `isConnectableEnd` | `boolean` | `true` | Can end connection |
| `isValidConnection` | `IsValidConnection` | `undefined` | Validation function |
| `onConnect` | `OnConnect` | `undefined` | Connect callback |

---

## Services

### FlowService

Core state management service.

#### Methods

**Node Management**

```typescript
setNodes(nodes: Node[]): void
getNodes(): Node[]
getNode(id: string): Node | undefined
getInternalNode(id: string): InternalNode | undefined
addNodes(nodes: Node[]): void
updateNode(id: string, updates: Partial<Node>): void
updateNodeData(id: string, data: any): void
deleteNode(id: string): void
deleteNodes(ids: string[]): void
applyNodeChanges(changes: NodeChange[]): void
```

**Edge Management**

```typescript
setEdges(edges: Edge[]): void
getEdges(): Edge[]
getEdge(id: string): Edge | undefined
getInternalEdge(id: string): InternalEdge | undefined
addEdges(edges: Edge[]): void
updateEdge(id: string, updates: Partial<Edge>): void
updateEdgeData(id: string, data: any): void
deleteEdge(id: string): void
deleteEdges(ids: string[]): void
applyEdgeChanges(changes: EdgeChange[]): void
```

**Viewport Management**

```typescript
setViewport(viewport: Viewport): void
getViewport(): Viewport
setDimensions(dimensions: Dimensions): void
getDimensions(): Dimensions
```

**Configuration**

```typescript
setNodeOrigin(nodeOrigin: NodeOrigin): void
setMinZoom(minZoom: number): void
setMaxZoom(maxZoom: number): void
setTranslateExtent(extent: CoordinateExtent): void
setNodeExtent(extent: CoordinateExtent): void
setSnapToGrid(snap: boolean): void
setSnapGrid(grid: [number, number]): void
setNodesDraggable(draggable: boolean): void
setNodesConnectable(connectable: boolean): void
setElementsSelectable(selectable: boolean): void
```

#### Signals

```typescript
// Read-only signals
readonly nodes: Signal<Node[]>
readonly edges: Signal<Edge[]>
readonly viewport: Signal<Viewport>
readonly transform: Signal<Transform>
readonly internalNodes: Signal<InternalNode[]>
readonly internalEdges: Signal<InternalEdge[]>
readonly nodeLookup: Signal<Map<string, InternalNode>>
readonly edgeLookup: Signal<Map<string, InternalEdge>>
readonly selectedNodes: Signal<InternalNode[]>
readonly selectedEdges: Signal<InternalEdge[]>
readonly visibleNodes: Signal<InternalNode[]>
readonly dimensions: Signal<Dimensions>
```

### ViewportService

Viewport control and transformations.

#### Methods

**Zoom Operations**

```typescript
zoomIn(options?: PanZoomOptions): Promise<boolean>
zoomOut(options?: PanZoomOptions): Promise<boolean>
zoomTo(zoom: number, options?: PanZoomOptions): Promise<boolean>
zoomBy(factor: number, options?: PanZoomOptions): Promise<boolean>
```

**Pan Operations**

```typescript
panBy(delta: XYPosition, options?: PanZoomOptions): Promise<boolean>
setCenter(x: number, y: number, options?: PanZoomOptions): Promise<boolean>
```

**Fit View**

```typescript
fitView(options?: FitViewOptions): Promise<boolean>
fitBounds(bounds: Rect, options?: PanZoomOptions): Promise<boolean>
```

**Viewport Control**

```typescript
setViewport(viewport: Viewport, options?: PanZoomOptions): Promise<boolean>
getViewport(): Viewport
getTransform(): Transform
```

**Coordinate Transformations**

```typescript
screenToFlowPosition(position: XYPosition): XYPosition
flowToScreenPosition(position: XYPosition): XYPosition
project(position: XYPosition): XYPosition
```

**Event Handlers**

```typescript
handleZoomOnScroll(event: WheelEvent, zoomSpeed?: number): void
handlePanOnScroll(event: WheelEvent, speed?: number): void
```

---

## Types

### Core Types

```typescript
interface XYPosition {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Rect extends XYPosition, Dimensions {}

type Transform = [number, number, number]; // [x, y, zoom]

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

type NodeOrigin = [number, number];
type CoordinateExtent = [[number, number], [number, number]];
```

### Node Types

```typescript
interface Node<T = any, K extends string = string> {
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

interface InternalNode<T = any, K extends string = string> extends Node<T, K> {
  measured: Dimensions;
  internals: NodeInternals;
  positionAbsolute: XYPosition;
  dragging?: boolean;
}
```

### Edge Types

```typescript
interface Edge<T = any, K extends string = string> {
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

interface PathOptions {
  offset?: number;
  borderRadius?: number;
  curvature?: number;
}
```

### Change Types

```typescript
type NodeChange =
  | NodeDimensionChange
  | NodePositionChange
  | NodeSelectionChange
  | NodeRemoveChange
  | NodeAddChange
  | NodeReplaceChange
  | NodeResetChange;

type EdgeChange =
  | EdgeSelectionChange
  | EdgeRemoveChange
  | EdgeAddChange
  | EdgeReplaceChange
  | EdgeResetChange;
```

---

## Utilities

### Edge Utilities

```typescript
// Path calculations
getBezierPath(params: BezierPathParams): EdgePathResult
getSmoothStepPath(params: SmoothStepPathParams): EdgePathResult
getStepPath(params: StepPathParams): EdgePathResult
getStraightPath(params: EdgePositionParams): EdgePathResult

// Position helpers
getEdgeCenter(params): [number, number, number, number]
getOppositePosition(position: Position): Position
```

### Graph Utilities

```typescript
// Traversal
getOutgoers(node, nodes, edges): Node[]
getIncomers(node, nodes, edges): Node[]
getConnectedEdges(nodes, edges): Edge[]

// Hierarchy
getChildNodes(node, nodes): Node[]
getDescendants(node, nodes): Node[]
getParentNode(node, nodes): Node | undefined
getAncestors(node, nodes): Node[]

// Selection
getSelectedNodes(nodes): Node[]
getSelectedEdges(edges): Edge[]
```

### Change Utilities

```typescript
// Apply changes
applyNodeChanges(changes: NodeChange[], nodes: Node[]): Node[]
applyEdgeChanges(changes: EdgeChange[], edges: Edge[]): Edge[]

// Create changes
createNodeSelectionChange(id: string, selected: boolean): NodeChange
createNodePositionChange(id: string, position: XYPosition, dragging?: boolean): NodeChange
createEdgeSelectionChange(id: string, selected: boolean): EdgeChange
```

---

## Constants

```typescript
// Defaults
DEFAULT_VIEWPORT: Viewport
DEFAULT_NODE_ORIGIN: NodeOrigin
DEFAULT_ZOOM.MIN: number
DEFAULT_ZOOM.MAX: number
DEFAULT_ZOOM.STEP: number
DEFAULT_SNAP_GRID: [number, number]

// CSS Classes
CSS_CLASSES.FLOW: string
CSS_CLASSES.NODE: string
CSS_CLASSES.EDGE: string
// ... and more
```

---

For more examples and use cases, see [GETTING_STARTED.md](./GETTING_STARTED.md).
