# Getting Started with NgxFlow

This guide will help you get up and running with NgxFlow quickly.

## Prerequisites

- Angular 18 or higher
- TypeScript 5.0 or higher
- Node.js 18 or higher

## Installation

### Option 1: Copy the Library (Current Approach)

Since NgxFlow is implemented as a standalone library in this project:

```bash
# Navigate to your project
cd your-angular-project

# Copy the library source
cp -r path/to/ngx-flow-workspace/projects/ngx-flow/src/lib src/app/lib/ngx-flow
```

### Option 2: Include as a Project Library

Add the library to your workspace:

```bash
# Copy the entire library project
cp -r path/to/ngx-flow-workspace/projects/ngx-flow projects/
```

Then build and use it:

```bash
ng build ngx-flow
```

## Basic Setup

### Step 1: Create Your Component

Create a new component or modify your existing one:

```typescript
import { Component, signal } from '@angular/core';
import { NgFlowComponent } from './lib/ngx-flow';
import type { Node, Edge, NodeChange, EdgeChange } from './lib/ngx-flow';

@Component({
  selector: 'app-flow-diagram',
  standalone: true,
  imports: [NgFlowComponent],
  template: `
    <div class="flow-container">
      <ngx-flow
        [nodes]="nodes()"
        [edges]="edges()"
        (onNodesChange)="onNodesChange($event)"
        (onEdgesChange)="onEdgesChange($event)"
        [fitView]="true"
      />
    </div>
  `,
  styles: [`
    .flow-container {
      width: 100%;
      height: 600px;
    }
  `]
})
export class FlowDiagramComponent {
  // Initialize with some nodes
  nodes = signal<Node[]>([
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Start' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: 'Process' },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 500, y: 100 },
      data: { label: 'End' },
    },
  ]);

  // Initialize with some edges
  edges = signal<Edge[]>([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      animated: true,
    },
  ]);

  // Handle node changes
  onNodesChange(changes: NodeChange[]): void {
    console.log('Nodes changed:', changes);
    // Changes are automatically applied by the library
  }

  // Handle edge changes
  onEdgesChange(changes: EdgeChange[]): void {
    console.log('Edges changed:', changes);
    // Changes are automatically applied by the library
  }
}
```

### Step 2: Add to Your Module/Component

If using a standalone application (Angular 18+):

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, {
  providers: []
});
```

## Common Use Cases

### 1. Adding Nodes Dynamically

```typescript
export class FlowDiagramComponent {
  nodes = signal<Node[]>([]);

  addNode() {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500
      },
      data: {
        label: `Node ${this.nodes().length + 1}`
      },
    };

    this.nodes.update(nodes => [...nodes, newNode]);
  }
}
```

Template:

```html
<button (click)="addNode()">Add Node</button>
<ngx-flow [nodes]="nodes()" />
```

### 2. Removing Selected Nodes

```typescript
deleteSelectedNodes() {
  this.nodes.update(nodes => nodes.filter(n => !n.selected));

  // Also remove connected edges
  this.edges.update(edges => {
    const nodeIds = new Set(this.nodes().map(n => n.id));
    return edges.filter(e =>
      nodeIds.has(e.source) && nodeIds.has(e.target)
    );
  });
}
```

### 3. Handling Connections

```typescript
import type { Connection } from './lib/ngx-flow';

onConnect(connection: Connection) {
  // Validate connection if needed
  if (connection.source === connection.target) {
    console.warn('Cannot connect node to itself');
    return;
  }

  // Create new edge
  const newEdge: Edge = {
    id: `e${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
  };

  this.edges.update(edges => [...edges, newEdge]);
}
```

Template:

```html
<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  (onConnect)="onConnect($event)"
/>
```

### 4. Programmatic Viewport Control

```typescript
import { ViewportService } from './lib/ngx-flow';

export class FlowDiagramComponent {
  private viewportService!: ViewportService;

  onFlowInit(event: any) {
    this.viewportService = event.viewportService;
  }

  zoomIn() {
    this.viewportService.zoomIn({ duration: 300 });
  }

  zoomOut() {
    this.viewportService.zoomOut({ duration: 300 });
  }

  fitView() {
    this.viewportService.fitView({
      duration: 300,
      padding: 0.2
    });
  }

  centerOnNode(nodeId: string) {
    const node = this.nodes().find(n => n.id === nodeId);
    if (node) {
      this.viewportService.setCenter(
        node.position.x,
        node.position.y,
        { duration: 300 }
      );
    }
  }
}
```

Template:

```html
<div class="controls">
  <button (click)="zoomIn()">Zoom In</button>
  <button (click)="zoomOut()">Zoom Out</button>
  <button (click)="fitView()">Fit View</button>
</div>

<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  (onInit)="onFlowInit($event)"
/>
```

### 5. Customizing Node Appearance

```typescript
nodes = signal<Node[]>([
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: {
      label: 'Custom Node',
      backgroundColor: '#ff6b6b'
    },
    style: {
      backgroundColor: '#ff6b6b',
      color: 'white',
      border: '2px solid #c92a2a',
      borderRadius: '8px',
      padding: '10px'
    }
  }
]);
```

### 6. Different Edge Types

```typescript
edges = signal<Edge[]>([
  {
    id: 'e1',
    source: '1',
    target: '2',
    type: 'bezier', // default curved edge
  },
  {
    id: 'e2',
    source: '2',
    target: '3',
    type: 'smoothstep', // orthogonal with rounded corners
    pathOptions: {
      offset: 30,
      borderRadius: 10
    }
  },
  {
    id: 'e3',
    source: '3',
    target: '4',
    type: 'step', // orthogonal with sharp corners
  },
  {
    id: 'e4',
    source: '4',
    target: '5',
    type: 'straight', // straight line
  }
]);
```

## Enabling Features

### Background Pattern

```html
<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  [showBackground]="true"
/>
```

### Minimap

```html
<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  [showMinimap]="true"
/>
```

### Controls

```html
<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  [showControls]="true"
/>
```

### All Features

```html
<ngx-flow
  [nodes]="nodes()"
  [edges]="edges()"
  [showBackground]="true"
  [showMinimap]="true"
  [showControls]="true"
  [snapToGrid]="true"
  [snapGrid]="[20, 20]"
  [fitView]="true"
  [minZoom]="0.5"
  [maxZoom]="2"
/>
```

## Styling

### Basic Styles

Add to your global styles or component styles:

```css
/* Container must have height */
.flow-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e2e2e2;
  border-radius: 4px;
}

/* Custom node styles */
::ng-deep .ngx-flow__node {
  cursor: move;
}

::ng-deep .ngx-flow__node.selected {
  box-shadow: 0 0 0 2px #1a192b;
}

/* Custom edge styles */
::ng-deep .ngx-flow__edge-path {
  stroke-width: 2;
  stroke: #b1b1b7;
}

::ng-deep .ngx-flow__edge.selected .ngx-flow__edge-path {
  stroke: #555;
  stroke-width: 3;
}
```

## Next Steps

- Read the [API Documentation](./API_DOCUMENTATION.md)
- Check out the [example application](./src/app/app.ts)
- Explore [advanced features](./ADVANCED_FEATURES.md)

## Troubleshooting

### Nodes not appearing

Make sure:
1. The container has a defined height
2. Nodes have valid positions
3. `fitView` is enabled or viewport is set correctly

### Changes not reflected

Make sure you're:
1. Using signals correctly
2. Creating new arrays/objects (immutable updates)
3. Not mutating state directly

### Performance issues

For large graphs:
1. Implement virtual scrolling
2. Limit visible nodes based on viewport
3. Use `trackBy` functions in templates
4. Consider lazy loading node content

## Support

If you encounter issues:
1. Check the example application
2. Review the API documentation
3. Open an issue with a minimal reproduction
