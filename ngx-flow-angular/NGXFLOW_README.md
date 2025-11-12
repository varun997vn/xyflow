# NgxFlow - Angular Flow Library

A powerful and flexible flow/diagram library for Angular 18+, inspired by xyflow. Create interactive node-based diagrams, workflows, and visual editors with ease.

## Features

- ⚡ **Built for Angular 18+** - Uses modern Angular features like signals and standalone components
- 🎨 **Highly Customizable** - Custom nodes, edges, and handles with full control over styling
- 🔄 **Reactive** - Built with Angular signals for optimal performance
- 🎯 **Interactive** - Drag nodes, zoom, pan, and connect nodes with ease
- 📱 **Responsive** - Works on desktop and touch devices
- 🎭 **Feature-Rich** - Minimap, controls, background patterns, and more
- 🏗️ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🚀 **Performance** - Optimized rendering with OnPush change detection
- 🎨 **Multiple Edge Types** - Bezier, smooth step, step, and straight edges
- 📐 **Snap to Grid** - Optional grid snapping for precise node placement

## Installation

Since this is a standalone library implementation, you can include it in your Angular project:

```bash
# Copy the library files to your project
cp -r projects/ngx-flow/src/lib/* your-project/src/lib/ngx-flow/
```

## Quick Start

### 1. Import the Component

```typescript
import { Component, signal } from '@angular/core';
import { NgFlowComponent, Node, Edge } from './lib/ngx-flow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFlowComponent],
  template: `
    <ngx-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [fitView]="true"
      [showControls]="true"
      [showMinimap]="true"
      [showBackground]="true"
    />
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  nodes = signal<Node[]>([
    {
      id: '1',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' }
    },
    {
      id: '2',
      position: { x: 300, y: 100 },
      data: { label: 'Node 2' }
    }
  ]);

  edges = signal<Edge[]>([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true
    }
  ]);
}
```

## Core Concepts

### Nodes

Nodes are the main building blocks of your flow. Each node has:

- **id**: Unique identifier
- **position**: X/Y coordinates
- **data**: Custom data (can be anything)
- **type**: Optional type for custom rendering

### Edges

Edges connect nodes together:

- **source**: Source node ID
- **target**: Target node ID
- **animated**: Optional animation
- **type**: Edge type (bezier, smoothstep, step, straight)

### Viewport

Control the view with zoom and pan:

- Scroll to zoom
- Drag background to pan
- Double-click to zoom in
- Use controls for zoom/fit view

## Configuration Options

### NgxFlow Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nodes` | `Node[]` | `[]` | Array of nodes (controlled) |
| `edges` | `Edge[]` | `[]` | Array of edges (controlled) |
| `defaultNodes` | `Node[]` | `[]` | Initial nodes (uncontrolled) |
| `defaultEdges` | `Edge[]` | `[]` | Initial edges (uncontrolled) |
| `nodesDraggable` | `boolean` | `true` | Enable/disable node dragging |
| `nodesConnectable` | `boolean` | `true` | Enable/disable node connections |
| `elementsSelectable` | `boolean` | `true` | Enable/disable element selection |
| `snapToGrid` | `boolean` | `false` | Snap nodes to grid |
| `snapGrid` | `[number, number]` | `[15, 15]` | Grid size for snapping |
| `minZoom` | `number` | `0.5` | Minimum zoom level |
| `maxZoom` | `number` | `2` | Maximum zoom level |
| `fitView` | `boolean` | `false` | Fit view on initialization |
| `showBackground` | `boolean` | `false` | Show background pattern |
| `showMinimap` | `boolean` | `false` | Show minimap |
| `showControls` | `boolean` | `false` | Show zoom/fit controls |
| `zoomOnScroll` | `boolean` | `true` | Enable zoom on scroll |
| `panOnScroll` | `boolean` | `false` | Enable pan on scroll |

## Usage Examples

See the example application in `src/app/` for a complete working example.

### Key Features Demonstrated

1. **Node Management** - Add, remove, and update nodes
2. **Edge Management** - Create and delete connections
3. **Selection** - Select nodes and edges with click
4. **Dragging** - Drag nodes to reposition
5. **Zooming** - Scroll to zoom in/out
6. **Controls** - Use built-in controls for zoom and fit view
7. **Minimap** - Overview of the entire flow
8. **Background** - Visual grid for better spatial awareness

## Architecture

### Services

- **FlowService** - Core state management using Angular signals
- **ViewportService** - Handles pan, zoom, and viewport transformations

### Components

- **NgFlowComponent** - Main container component
- **NodeWrapperComponent** - Wraps and renders nodes
- **EdgeWrapperComponent** - Renders edge paths
- **BackgroundComponent** - Renders background patterns
- **MinimapComponent** - Overview minimap
- **ControlsComponent** - Zoom and fit view controls
- **HandleComponent** - Connection handles for nodes

### Utilities

- **Edge Path Calculations** - Bezier, smooth step, step, and straight paths
- **Coordinate Transformations** - Screen to flow and vice versa
- **Graph Utilities** - Node/edge traversal and lookups
- **Change Applications** - Apply atomic changes to nodes/edges

## Performance

NgxFlow is built with performance in mind:

- **OnPush Change Detection** - Minimizes unnecessary re-renders
- **Angular Signals** - Reactive state management with fine-grained updates
- **Computed Values** - Derived state is automatically memoized
- **Efficient Lookups** - O(1) node and edge lookups using Maps

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Comparison with React Flow

NgxFlow brings the power of React Flow to Angular with:

- Angular-specific patterns (signals, standalone components)
- Type-safe Angular APIs
- Angular best practices and architecture
- No React dependencies

## Roadmap

- [ ] Custom node type system with templates
- [ ] Custom edge type system
- [ ] Connection validation callbacks
- [ ] Subflows/grouped nodes
- [ ] Auto-layout algorithms
- [ ] Export/import functionality
- [ ] Undo/redo support
- [ ] Enhanced accessibility
- [ ] Performance optimizations for 10,000+ nodes
- [ ] Mobile/touch improvements

## Acknowledgments

This library is inspired by [xyflow/xyflow](https://github.com/xyflow/xyflow), bringing similar functionality to Angular with Angular-specific optimizations.

---

Made with ❤️ for the Angular community
