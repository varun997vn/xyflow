/**
 * Graph traversal and manipulation utilities
 */

import { Node, Edge, InternalNode, Connection } from '../types';

// ============================================================================
// Graph Traversal
// ============================================================================

/**
 * Gets all nodes that this node connects TO (outgoing connections)
 */
export function getOutgoers<T extends Node = Node>(
  node: T,
  nodes: T[],
  edges: Edge[]
): T[] {
  const outgoingEdges = edges.filter(edge => edge.source === node.id);
  const targetIds = outgoingEdges.map(edge => edge.target);
  return nodes.filter(n => targetIds.includes(n.id));
}

/**
 * Gets all nodes that connect TO this node (incoming connections)
 */
export function getIncomers<T extends Node = Node>(
  node: T,
  nodes: T[],
  edges: Edge[]
): T[] {
  const incomingEdges = edges.filter(edge => edge.target === node.id);
  const sourceIds = incomingEdges.map(edge => edge.source);
  return nodes.filter(n => sourceIds.includes(n.id));
}

/**
 * Gets all edges connected to the given nodes
 */
export function getConnectedEdges(
  nodes: Node[],
  edges: Edge[]
): Edge[] {
  const nodeIds = new Set(nodes.map(n => n.id));

  return edges.filter(
    edge => nodeIds.has(edge.source) || nodeIds.has(edge.target)
  );
}

/**
 * Gets all edges where the given node is the source
 */
export function getOutgoingEdges(node: Node, edges: Edge[]): Edge[] {
  return edges.filter(edge => edge.source === node.id);
}

/**
 * Gets all edges where the given node is the target
 */
export function getIncomingEdges(node: Node, edges: Edge[]): Edge[] {
  return edges.filter(edge => edge.target === node.id);
}

// ============================================================================
// Connection Validation
// ============================================================================

/**
 * Checks if a connection already exists
 */
export function isConnectionExists(
  connection: Connection,
  edges: Edge[]
): boolean {
  return edges.some(
    edge =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      (edge.sourceHandle || null) === (connection.sourceHandle || null) &&
      (edge.targetHandle || null) === (connection.targetHandle || null)
  );
}

/**
 * Checks if a connection would create a cycle
 */
export function wouldCreateCycle(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): boolean {
  const { source, target } = connection;

  if (source === target) {
    return true; // Self-loop
  }

  // Check if there's already a path from target to source
  const visited = new Set<string>();
  const queue = [target];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === source) {
      return true; // Cycle detected
    }

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);

    const currentNode = nodes.find(n => n.id === currentId);
    if (!currentNode) continue;

    const outgoers = getOutgoers(currentNode, nodes, edges);
    queue.push(...outgoers.map(n => n.id));
  }

  return false;
}

// ============================================================================
// Node Hierarchy
// ============================================================================

/**
 * Gets all child nodes of a parent node
 */
export function getChildNodes<T extends Node = Node>(
  node: T,
  nodes: T[]
): T[] {
  return nodes.filter(n => n.parentId === node.id);
}

/**
 * Gets all descendant nodes (children, grandchildren, etc.)
 */
export function getDescendants<T extends Node = Node>(
  node: T,
  nodes: T[]
): T[] {
  const descendants: T[] = [];
  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = getChildNodes(current, nodes);

    descendants.push(...children);
    stack.push(...children);
  }

  return descendants;
}

/**
 * Gets parent node
 */
export function getParentNode<T extends Node = Node>(
  node: T,
  nodes: T[]
): T | undefined {
  if (!node.parentId) return undefined;
  return nodes.find(n => n.id === node.parentId);
}

/**
 * Gets all ancestor nodes (parent, grandparent, etc.)
 */
export function getAncestors<T extends Node = Node>(
  node: T,
  nodes: T[]
): T[] {
  const ancestors: T[] = [];
  let current = node;

  while (current.parentId) {
    const parent = getParentNode(current, nodes);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }

  return ancestors;
}

// ============================================================================
// Selection Helpers
// ============================================================================

/**
 * Gets all selected nodes
 */
export function getSelectedNodes<T extends Node = Node>(nodes: T[]): T[] {
  return nodes.filter(n => n.selected);
}

/**
 * Gets all selected edges
 */
export function getSelectedEdges(edges: Edge[]): Edge[] {
  return edges.filter(e => e.selected);
}

// ============================================================================
// Node/Edge Lookup
// ============================================================================

/**
 * Creates a node lookup map for O(1) access
 */
export function createNodeLookup<T extends Node = Node>(
  nodes: T[]
): Map<string, T> {
  return new Map(nodes.map(node => [node.id, node]));
}

/**
 * Creates an edge lookup map for O(1) access
 */
export function createEdgeLookup(edges: Edge[]): Map<string, Edge> {
  return new Map(edges.map(edge => [edge.id, edge]));
}

/**
 * Creates a parent-children lookup map
 */
export function createParentLookup<T extends Node = Node>(
  nodes: T[]
): Map<string, T[]> {
  const lookup = new Map<string, T[]>();

  for (const node of nodes) {
    if (node.parentId) {
      const children = lookup.get(node.parentId) || [];
      children.push(node);
      lookup.set(node.parentId, children);
    }
  }

  return lookup;
}

// ============================================================================
// Connection Lookup
// ============================================================================

/**
 * Creates a handle connection lookup for checking connections
 */
export function createConnectionLookup(edges: Edge[]): Map<string, Set<string>> {
  const lookup = new Map<string, Set<string>>();

  for (const edge of edges) {
    const sourceKey = `${edge.source}-${edge.sourceHandle || 'default'}-source`;
    const targetKey = `${edge.target}-${edge.targetHandle || 'default'}-target`;

    if (!lookup.has(sourceKey)) {
      lookup.set(sourceKey, new Set());
    }
    if (!lookup.has(targetKey)) {
      lookup.set(targetKey, new Set());
    }

    lookup.get(sourceKey)!.add(edge.id);
    lookup.get(targetKey)!.add(edge.id);
  }

  return lookup;
}

/**
 * Gets edges connected to a specific handle
 */
export function getHandleEdges(
  nodeId: string,
  handleId: string | null,
  handleType: 'source' | 'target',
  edges: Edge[]
): Edge[] {
  if (handleType === 'source') {
    return edges.filter(
      e => e.source === nodeId && (e.sourceHandle || null) === handleId
    );
  } else {
    return edges.filter(
      e => e.target === nodeId && (e.targetHandle || null) === handleId
    );
  }
}

// ============================================================================
// Edge ID Generation
// ============================================================================

/**
 * Generates a unique edge ID from connection
 */
export function getEdgeId(connection: Connection): string {
  const { source, sourceHandle, target, targetHandle } = connection;
  return `xy-edge__${source}${sourceHandle || ''}-${target}${targetHandle || ''}`;
}

/**
 * Adds a new edge from connection
 */
export function addEdge(connection: Connection, edges: Edge[]): Edge[] {
  if (isConnectionExists(connection, edges)) {
    return edges;
  }

  const edge: Edge = {
    id: getEdgeId(connection),
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
  };

  return [...edges, edge];
}
