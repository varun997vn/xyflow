/**
 * General utility functions for coordinate transformations, bounds calculations, etc.
 */

import {
  XYPosition,
  Dimensions,
  Rect,
  Box,
  Transform,
  Viewport,
  CoordinateExtent,
  NodeOrigin,
  InternalNode,
  Node,
} from '../types';

// ============================================================================
// Coordinate Transformations
// ============================================================================

/**
 * Converts screen position to flow position
 */
export function screenToFlowPosition(
  position: XYPosition,
  transform: Transform = [0, 0, 1],
  snapToGrid = false,
  snapGrid: [number, number] = [15, 15]
): XYPosition {
  const [tx, ty, scale] = transform;

  const flowX = (position.x - tx) / scale;
  const flowY = (position.y - ty) / scale;

  return snapToGrid
    ? snapPosition({ x: flowX, y: flowY }, snapGrid)
    : { x: flowX, y: flowY };
}

/**
 * Converts flow position to screen position
 */
export function flowToScreenPosition(
  position: XYPosition,
  transform: Transform = [0, 0, 1]
): XYPosition {
  const [tx, ty, scale] = transform;

  return {
    x: position.x * scale + tx,
    y: position.y * scale + ty,
  };
}

/**
 * Snaps position to grid
 */
export function snapPosition(
  position: XYPosition,
  snapGrid: [number, number] = [15, 15]
): XYPosition {
  return {
    x: snapGrid[0] * Math.round(position.x / snapGrid[0]),
    y: snapGrid[1] * Math.round(position.y / snapGrid[1]),
  };
}

// ============================================================================
// Bounds Calculations
// ============================================================================

/**
 * Calculates bounding box for multiple nodes
 */
export function getNodesBounds(
  nodes: InternalNode[],
  nodeOrigin: NodeOrigin = [0, 0]
): Rect {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    if (node.hidden) continue;

    const { positionAbsolute, measured } = node;
    const x = positionAbsolute.x - measured.width * nodeOrigin[0];
    const y = positionAbsolute.y - measured.height * nodeOrigin[1];

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + measured.width);
    maxY = Math.max(maxY, y + measured.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates viewport to fit given bounds
 */
export function getViewportForBounds(
  bounds: Rect,
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number,
  padding = 0.1
): Viewport {
  const paddingX = width * padding;
  const paddingY = height * padding;

  const xZoom = (width - paddingX) / bounds.width;
  const yZoom = (height - paddingY) / bounds.height;

  let zoom = Math.min(xZoom, yZoom);
  zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;

  const x = width / 2 - boundsCenterX * zoom;
  const y = height / 2 - boundsCenterY * zoom;

  return { x, y, zoom };
}

/**
 * Checks if two rectangles intersect
 */
export function rectIntersects(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x > rect2.x + rect2.width ||
    rect1.x + rect1.width < rect2.x ||
    rect1.y > rect2.y + rect2.height ||
    rect1.y + rect1.height < rect2.y
  );
}

/**
 * Checks if a point is inside a rectangle
 */
export function pointInRect(point: XYPosition, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Checks if a rect is inside another rect
 */
export function rectContainsRect(rect1: Rect, rect2: Rect): boolean {
  return (
    rect2.x >= rect1.x &&
    rect2.x + rect2.width <= rect1.x + rect1.width &&
    rect2.y >= rect1.y &&
    rect2.y + rect2.height <= rect1.y + rect1.height
  );
}

/**
 * Converts Rect to Box
 */
export function rectToBox(rect: Rect): Box {
  return {
    x: rect.x,
    y: rect.y,
    x2: rect.x + rect.width,
    y2: rect.y + rect.height,
  };
}

/**
 * Converts Box to Rect
 */
export function boxToRect(box: Box): Rect {
  return {
    x: box.x,
    y: box.y,
    width: box.x2 - box.x,
    height: box.y2 - box.y,
  };
}

// ============================================================================
// Clamping and Extent
// ============================================================================

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamps position within extent
 */
export function clampPosition(
  position: XYPosition,
  extent: CoordinateExtent,
  dimensions?: Dimensions
): XYPosition {
  const [[minX, minY], [maxX, maxY]] = extent;
  const width = dimensions?.width || 0;
  const height = dimensions?.height || 0;

  return {
    x: clamp(position.x, minX, maxX - width),
    y: clamp(position.y, minY, maxY - height),
  };
}

/**
 * Calculates absolute position from relative position and parent
 */
export function calculateAbsolutePosition(
  position: XYPosition,
  parentPosition: XYPosition,
  nodeOrigin: NodeOrigin,
  dimensions?: Dimensions
): XYPosition {
  const offsetX = (dimensions?.width || 0) * nodeOrigin[0];
  const offsetY = (dimensions?.height || 0) * nodeOrigin[1];

  return {
    x: parentPosition.x + position.x - offsetX,
    y: parentPosition.y + position.y - offsetY,
  };
}

// ============================================================================
// Auto Pan
// ============================================================================

/**
 * Calculates auto pan velocity based on mouse position near edges
 */
export function calculateAutoPan(
  position: XYPosition,
  bounds: Dimensions,
  speed = 15,
  distance = 40
): [number, number] {
  const { x, y } = position;
  const { width, height } = bounds;

  let xMovement = 0;
  let yMovement = 0;

  // Left edge
  if (x < distance) {
    xMovement = Math.abs(x - distance) / distance;
  }
  // Right edge
  else if (x > width - distance) {
    xMovement = -Math.abs(x - (width - distance)) / distance;
  }

  // Top edge
  if (y < distance) {
    yMovement = Math.abs(y - distance) / distance;
  }
  // Bottom edge
  else if (y > height - distance) {
    yMovement = -Math.abs(y - (height - distance)) / distance;
  }

  return [xMovement * speed, yMovement * speed];
}

// ============================================================================
// Distance and Geometry
// ============================================================================

/**
 * Calculates Euclidean distance between two points
 */
export function getDistance(a: XYPosition, b: XYPosition): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Calculates the center point of a rectangle
 */
export function getRectCenter(rect: Rect): XYPosition {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

/**
 * Generates a unique ID
 */
export function generateId(prefix = 'ngx-flow'): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

// ============================================================================
// Deep Clone
// ============================================================================

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Checks if two arrays have the same items (order independent)
 */
export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;

  const set1 = new Set(arr1);
  return arr2.every(item => set1.has(item));
}

/**
 * Returns unique items from an array
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// ============================================================================
// Viewport Utilities
// ============================================================================

/**
 * Creates a transform from viewport
 */
export function viewportToTransform(viewport: Viewport): Transform {
  return [viewport.x, viewport.y, viewport.zoom];
}

/**
 * Creates a viewport from transform
 */
export function transformToViewport(transform: Transform): Viewport {
  return {
    x: transform[0],
    y: transform[1],
    zoom: transform[2],
  };
}

/**
 * Checks if viewport is initialized (not at origin with zoom 1)
 */
export function isViewportInitialized(viewport: Viewport): boolean {
  return viewport.x !== 0 || viewport.y !== 0 || viewport.zoom !== 1;
}
