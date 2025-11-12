/**
 * Change application utilities for nodes and edges
 */

import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  InternalNode,
  InternalEdge,
} from '../types';

// ============================================================================
// Node Changes
// ============================================================================

/**
 * Applies node changes to a nodes array
 */
export function applyNodeChanges(
  changes: NodeChange[],
  nodes: Node[]
): Node[] {
  const changeMap = new Map<string, NodeChange[]>();

  // Group changes by node ID
  for (const change of changes) {
    if (change.type === 'reset') {
      return [...change.items];
    }

    if (change.type === 'add') {
      nodes = [...nodes, change.item];
      continue;
    }

    const nodeChanges = changeMap.get(change.id) || [];
    nodeChanges.push(change);
    changeMap.set(change.id, nodeChanges);
  }

  // Apply changes to each node
  const updatedNodes: Node[] = [];

  for (const node of nodes) {
    const nodeChanges = changeMap.get(node.id);

    if (!nodeChanges) {
      updatedNodes.push(node);
      continue;
    }

    let updatedNode: Node | null = { ...node };

    for (const change of nodeChanges) {
      if (change.type === 'remove') {
        updatedNode = null;
        break;
      }

      if (change.type === 'replace') {
        updatedNode = { ...change.item };
        continue;
      }

      if (change.type === 'select') {
        updatedNode = {
          ...updatedNode!,
          selected: change.selected,
        };
        continue;
      }

      if (change.type === 'position') {
        updatedNode = {
          ...updatedNode!,
          position: change.position || updatedNode!.position,
          dragging: change.dragging,
        };
        continue;
      }

      if (change.type === 'dimensions') {
        updatedNode = {
          ...updatedNode!,
          width: change.dimensions.width,
          height: change.dimensions.height,
        };
        continue;
      }
    }

    if (updatedNode) {
      updatedNodes.push(updatedNode);
    }
  }

  return updatedNodes;
}

/**
 * Creates a selection change for a node
 */
export function createNodeSelectionChange(
  id: string,
  selected: boolean
): NodeChange {
  return {
    type: 'select',
    id,
    selected,
  };
}

/**
 * Creates a position change for a node
 */
export function createNodePositionChange(
  id: string,
  position: { x: number; y: number },
  dragging?: boolean
): NodeChange {
  return {
    type: 'position',
    id,
    position,
    dragging,
  };
}

/**
 * Creates a dimension change for a node
 */
export function createNodeDimensionChange(
  id: string,
  dimensions: { width: number; height: number }
): NodeChange {
  return {
    type: 'dimensions',
    id,
    dimensions,
  };
}

/**
 * Creates a remove change for a node
 */
export function createNodeRemoveChange(id: string): NodeChange {
  return {
    type: 'remove',
    id,
  };
}

/**
 * Creates selection changes for multiple nodes
 */
export function createNodesSelectionChanges(
  nodeIds: string[],
  selected: boolean
): NodeChange[] {
  return nodeIds.map(id => createNodeSelectionChange(id, selected));
}

// ============================================================================
// Edge Changes
// ============================================================================

/**
 * Applies edge changes to an edges array
 */
export function applyEdgeChanges(
  changes: EdgeChange[],
  edges: Edge[]
): Edge[] {
  const changeMap = new Map<string, EdgeChange[]>();

  // Group changes by edge ID
  for (const change of changes) {
    if (change.type === 'reset') {
      return [...change.items];
    }

    if (change.type === 'add') {
      edges = [...edges, change.item];
      continue;
    }

    const edgeChanges = changeMap.get(change.id) || [];
    edgeChanges.push(change);
    changeMap.set(change.id, edgeChanges);
  }

  // Apply changes to each edge
  const updatedEdges: Edge[] = [];

  for (const edge of edges) {
    const edgeChanges = changeMap.get(edge.id);

    if (!edgeChanges) {
      updatedEdges.push(edge);
      continue;
    }

    let updatedEdge: Edge | null = { ...edge };

    for (const change of edgeChanges) {
      if (change.type === 'remove') {
        updatedEdge = null;
        break;
      }

      if (change.type === 'replace') {
        updatedEdge = { ...change.item };
        continue;
      }

      if (change.type === 'select') {
        updatedEdge = {
          ...updatedEdge,
          selected: change.selected,
        };
        continue;
      }
    }

    if (updatedEdge) {
      updatedEdges.push(updatedEdge);
    }
  }

  return updatedEdges;
}

/**
 * Creates a selection change for an edge
 */
export function createEdgeSelectionChange(
  id: string,
  selected: boolean
): EdgeChange {
  return {
    type: 'select',
    id,
    selected,
  };
}

/**
 * Creates a remove change for an edge
 */
export function createEdgeRemoveChange(id: string): EdgeChange {
  return {
    type: 'remove',
    id,
  };
}

/**
 * Creates selection changes for multiple edges
 */
export function createEdgesSelectionChanges(
  edgeIds: string[],
  selected: boolean
): EdgeChange[] {
  return edgeIds.map(id => createEdgeSelectionChange(id, selected));
}

// ============================================================================
// Batch Change Utilities
// ============================================================================

/**
 * Deselects all nodes
 */
export function deselectAllNodes(nodes: Node[]): NodeChange[] {
  return nodes
    .filter(node => node.selected)
    .map(node => createNodeSelectionChange(node.id, false));
}

/**
 * Deselects all edges
 */
export function deselectAllEdges(edges: Edge[]): EdgeChange[] {
  return edges
    .filter(edge => edge.selected)
    .map(edge => createEdgeSelectionChange(edge.id, false));
}

/**
 * Removes selected nodes and connected edges
 */
export function removeSelectedElements(
  nodes: Node[],
  edges: Edge[]
): { nodeChanges: NodeChange[]; edgeChanges: EdgeChange[] } {
  const selectedNodeIds = new Set(
    nodes.filter(n => n.selected && n.deletable !== false).map(n => n.id)
  );

  const nodeChanges: NodeChange[] = Array.from(selectedNodeIds).map(id =>
    createNodeRemoveChange(id)
  );

  // Remove edges that are selected or connected to removed nodes
  const edgeChanges: EdgeChange[] = edges
    .filter(
      edge =>
        (edge.selected && edge.deletable !== false) ||
        selectedNodeIds.has(edge.source) ||
        selectedNodeIds.has(edge.target)
    )
    .map(edge => createEdgeRemoveChange(edge.id));

  return { nodeChanges, edgeChanges };
}
