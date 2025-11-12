import { Component, signal } from '@angular/core';
import { NgFlowComponent } from '../../projects/ngx-flow/src/public-api';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '../../projects/ngx-flow/src/public-api';

@Component({
  selector: 'app-root',
  imports: [NgFlowComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('NgxFlow Demo - Angular Flow Library');

  // Initial nodes
  nodes = signal<Node[]>([
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Input Node' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 100, y: 250 },
      data: { label: 'Processing Node' },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 400, y: 100 },
      data: { label: 'Output Node 1' },
    },
    {
      id: '4',
      type: 'default',
      position: { x: 400, y: 250 },
      data: { label: 'Output Node 2' },
    },
    {
      id: '5',
      type: 'default',
      position: { x: 400, y: 400 },
      data: { label: 'Output Node 3' },
    },
  ]);

  // Initial edges
  edges = signal<Edge[]>([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true,
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
    },
    {
      id: 'e2-5',
      source: '2',
      target: '5',
      animated: true,
    },
  ]);

  onNodesChange(changes: NodeChange[]): void {
    console.log('Nodes changed:', changes);
  }

  onEdgesChange(changes: EdgeChange[]): void {
    console.log('Edges changed:', changes);
  }

  onConnect(connection: Connection): void {
    console.log('Connection created:', connection);
    // Add new edge
    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };
    this.edges.update(edges => [...edges, newEdge]);
  }

  addNode(): void {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500
      },
      data: { label: `Node ${this.nodes().length + 1}` },
    };
    this.nodes.update(nodes => [...nodes, newNode]);
  }

  deleteSelectedNodes(): void {
    this.nodes.update(nodes => nodes.filter(n => !n.selected));
    this.edges.update(edges => {
      const nodeIds = new Set(this.nodes().map(n => n.id));
      return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    });
  }
}
