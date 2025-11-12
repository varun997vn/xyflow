/**
 * Constants for NgxFlow
 */

import { Viewport, NodeOrigin, CoordinateExtent } from './types';

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const DEFAULT_NODE_ORIGIN: NodeOrigin = [0, 0];

export const DEFAULT_ZOOM = {
  MIN: 0.5,
  MAX: 2,
  STEP: 0.1,
};

export const DEFAULT_SNAP_GRID: [number, number] = [15, 15];

export const DEFAULT_CONNECTION_RADIUS = 20;

export const DEFAULT_EXTENT: CoordinateExtent = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
];

export const DEFAULT_EDGE_INTERACTION_WIDTH = 20;

// ============================================================================
// Key Codes
// ============================================================================

export const KEY_CODES = {
  DELETE: ['Backspace', 'Delete'],
  SELECTION: ['Shift'],
  MULTI_SELECTION: ['Meta', 'Control'],
  ZOOM_ACTIVATION: ['Meta', 'Control'],
  PAN_ACTIVATION: ['Space'],
};

// ============================================================================
// CSS Classes
// ============================================================================

export const CSS_CLASSES = {
  FLOW: 'ngx-flow',
  VIEWPORT: 'ngx-flow__viewport',
  NODES: 'ngx-flow__nodes',
  NODE: 'ngx-flow__node',
  NODE_DEFAULT: 'ngx-flow__node-default',
  NODE_SELECTED: 'selected',
  NODE_DRAGGING: 'dragging',
  EDGES: 'ngx-flow__edges',
  EDGE: 'ngx-flow__edge',
  EDGE_PATH: 'ngx-flow__edge-path',
  EDGE_LABEL: 'ngx-flow__edge-label',
  EDGE_LABEL_BG: 'ngx-flow__edge-label-bg',
  EDGE_SELECTED: 'selected',
  EDGE_ANIMATED: 'animated',
  HANDLE: 'ngx-flow__handle',
  HANDLE_SOURCE: 'ngx-flow__handle-source',
  HANDLE_TARGET: 'ngx-flow__handle-target',
  HANDLE_CONNECTING: 'connecting',
  HANDLE_VALID: 'valid',
  HANDLE_INVALID: 'invalid',
  CONNECTION_LINE: 'ngx-flow__connection-line',
  PANE: 'ngx-flow__pane',
  SELECTION_RECT: 'ngx-flow__selection-rect',
  BACKGROUND: 'ngx-flow__background',
  MINIMAP: 'ngx-flow__minimap',
  CONTROLS: 'ngx-flow__controls',
};

// ============================================================================
// Marker IDs
// ============================================================================

export const MARKER_ID_PREFIX = 'ngx-flow__marker';

export const createMarkerId = (id: string, variant?: string): string => {
  return `${MARKER_ID_PREFIX}-${id}${variant ? `-${variant}` : ''}`;
};

// ============================================================================
// Edge Path Options
// ============================================================================

export const BEZIER_PATH_OPTIONS = {
  CURVATURE: 0.25,
};

export const SMOOTH_STEP_PATH_OPTIONS = {
  OFFSET: 20,
  BORDER_RADIUS: 5,
  STEP_POSITION: 0.5,
};

export const STEP_PATH_OPTIONS = {
  OFFSET: 20,
  STEP_POSITION: 0.5,
};

// ============================================================================
// Interaction Defaults
// ============================================================================

export const DRAG_THRESHOLD = 1; // pixels to move before drag starts

export const AUTO_PAN_SPEED = 15;
export const AUTO_PAN_DISTANCE = 40;

export const ZOOM_ON_SCROLL_SPEED = 0.5;

// ============================================================================
// Selection Defaults
// ============================================================================

export const SELECTION_RECT_PADDING = 5;

// ============================================================================
// Handle Defaults
// ============================================================================

export const HANDLE_DEFAULT_SIZE = 8;

// ============================================================================
// Minimap Defaults
// ============================================================================

export const MINIMAP_DEFAULTS = {
  WIDTH: 200,
  HEIGHT: 150,
  SCALE: 0.15,
  NODE_COLOR: '#e2e2e2',
  NODE_STROKE_COLOR: '#555',
  NODE_STROKE_WIDTH: 2,
  NODE_BORDER_RADIUS: 2,
  MASK_COLOR: 'rgba(0, 0, 0, 0.6)',
  MASK_STROKE_COLOR: '#fff',
  MASK_STROKE_WIDTH: 1,
  ZOOM_STEP: 10,
  OFFSET_SCALE: 1,
};

// ============================================================================
// Background Defaults
// ============================================================================

export const BACKGROUND_DEFAULTS = {
  GAP: 20,
  SIZE: 1,
  COLOR: '#81818a',
};

// ============================================================================
// Animation Defaults
// ============================================================================

export const ANIMATION_DURATION = 200;

export const EASING_FUNCTION = 'cubic-bezier(0.4, 0, 0.2, 1)';

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  NODE_NOT_FOUND: (id: string) => `Node with id "${id}" not found`,
  EDGE_NOT_FOUND: (id: string) => `Edge with id "${id}" not found`,
  INVALID_CONNECTION: 'Invalid connection',
  HANDLE_NOT_FOUND: (nodeId: string, handleId?: string) =>
    `Handle ${handleId ? `"${handleId}" ` : ''}on node "${nodeId}" not found`,
  DUPLICATE_NODE_ID: (id: string) => `Node with id "${id}" already exists`,
  DUPLICATE_EDGE_ID: (id: string) => `Edge with id "${id}" already exists`,
  INVALID_NODE_EXTENT: 'Invalid node extent',
  INVALID_TRANSLATE_EXTENT: 'Invalid translate extent',
};

// ============================================================================
// ARIA Labels
// ============================================================================

export const ARIA_LABELS = {
  FLOW: 'Flow diagram',
  NODE: (label?: string) => label || 'Node',
  EDGE: (label?: string) => label || 'Edge',
  HANDLE: (type: 'source' | 'target') =>
    type === 'source' ? 'Connection source' : 'Connection target',
  MINIMAP: 'Minimap',
  CONTROLS: 'Flow controls',
  CONTROL_ZOOM_IN: 'Zoom in',
  CONTROL_ZOOM_OUT: 'Zoom out',
  CONTROL_FIT_VIEW: 'Fit view',
  CONTROL_INTERACTIVE: 'Toggle interactivity',
};
