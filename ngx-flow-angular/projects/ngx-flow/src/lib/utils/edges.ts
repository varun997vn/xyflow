/**
 * Edge path calculation utilities
 */

import { Position, XYPosition, PathOptions } from '../types';
import { BEZIER_PATH_OPTIONS, SMOOTH_STEP_PATH_OPTIONS } from '../constants';

// ============================================================================
// Edge Path Calculation Result
// ============================================================================

export interface EdgePathResult {
  path: string;
  labelX: number;
  labelY: number;
  offsetX: number;
  offsetY: number;
}

export interface EdgePositionParams {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDirection(
  source: XYPosition,
  target: XYPosition,
  position: Position
): XYPosition {
  switch (position) {
    case Position.Top:
      return { x: 0, y: -1 };
    case Position.Bottom:
      return { x: 0, y: 1 };
    case Position.Left:
      return { x: -1, y: 0 };
    case Position.Right:
      return { x: 1, y: 0 };
  }
}

function calculateControlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }
  return curvature * 25 * Math.sqrt(-distance);
}

function getControlPoint(params: {
  pos: Position;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
}): [number, number] {
  const { pos, x1, y1, x2, y2, c } = params;

  switch (pos) {
    case Position.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case Position.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case Position.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case Position.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}

// ============================================================================
// Bezier Edge
// ============================================================================

export interface BezierPathParams extends EdgePositionParams {
  curvature?: number;
}

export function getBezierPath(params: BezierPathParams): EdgePathResult {
  const {
    sourceX,
    sourceY,
    sourcePosition = Position.Bottom,
    targetX,
    targetY,
    targetPosition = Position.Top,
    curvature = BEZIER_PATH_OPTIONS.CURVATURE,
  } = params;

  const [sourceControlX, sourceControlY] = getControlPoint({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature,
  });

  const [targetControlX, targetControlY] = getControlPoint({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature,
  });

  const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;

  const labelX = sourceControlX * 0.5 + targetControlX * 0.5;
  const labelY = sourceControlY * 0.5 + targetControlY * 0.5;

  const offsetX = Math.abs(targetX - sourceX) / 2;
  const offsetY = Math.abs(targetY - sourceY) / 2;

  return { path, labelX, labelY, offsetX, offsetY };
}

// ============================================================================
// Smooth Step Edge
// ============================================================================

export interface SmoothStepPathParams extends EdgePositionParams {
  offset?: number;
  borderRadius?: number;
  stepPosition?: number;
}

function getSmoothStepPathInternal(params: {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
  borderRadius: number;
  offset: number;
  stepPosition: number;
}): string {
  const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius, offset, stepPosition } = params;

  const cornerWidth = Math.min(borderRadius, Math.abs(targetX - sourceX));
  const cornerHeight = Math.min(borderRadius, Math.abs(targetY - sourceY));
  const cornerSize = Math.min(cornerWidth, cornerHeight, offset);

  const leftAndRight = [Position.Left, Position.Right];
  const cX = leftAndRight.includes(sourcePosition) ? sourceX : targetX;
  const cY = leftAndRight.includes(sourcePosition) ? targetY : sourceY;

  let path = `M ${sourceX},${sourceY}`;

  // Handle different position combinations
  if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
    const isHorizontalFirst = Math.abs(sourceX - cX) > cornerSize;
    const xDir = sourcePosition === Position.Right ? -1 : 1;

    if (isHorizontalFirst) {
      const midX = sourceX + (cX - sourceX) * stepPosition;
      path += ` L ${midX - xDir * cornerSize},${sourceY}`;
      path += ` Q ${midX},${sourceY} ${midX},${sourceY + (cY > sourceY ? cornerSize : -cornerSize)}`;
      path += ` L ${midX},${cY - (cY > sourceY ? cornerSize : -cornerSize)}`;
      path += ` Q ${midX},${cY} ${midX + xDir * cornerSize},${cY}`;
    } else {
      path += ` L ${sourceX + xDir * offset},${sourceY}`;
      path += ` L ${sourceX + xDir * offset},${cY}`;
    }

    if (leftAndRight.includes(targetPosition)) {
      const xTargetDir = targetPosition === Position.Right ? -1 : 1;
      path += ` L ${targetX - xTargetDir * offset},${cY}`;
      path += ` L ${targetX - xTargetDir * offset},${targetY}`;
    } else {
      const yTargetDir = targetPosition === Position.Bottom ? -1 : 1;
      path += ` L ${cX},${cY}`;
      path += ` L ${cX},${targetY - yTargetDir * offset}`;
    }
  } else {
    // Source is Top or Bottom
    const isVerticalFirst = Math.abs(sourceY - cY) > cornerSize;
    const yDir = sourcePosition === Position.Bottom ? -1 : 1;

    if (isVerticalFirst) {
      const midY = sourceY + (cY - sourceY) * stepPosition;
      path += ` L ${sourceX},${midY - yDir * cornerSize}`;
      path += ` Q ${sourceX},${midY} ${sourceX + (cX > sourceX ? cornerSize : -cornerSize)},${midY}`;
      path += ` L ${cX - (cX > sourceX ? cornerSize : -cornerSize)},${midY}`;
      path += ` Q ${cX},${midY} ${cX},${midY + yDir * cornerSize}`;
    } else {
      path += ` L ${sourceX},${sourceY + yDir * offset}`;
      path += ` L ${cX},${sourceY + yDir * offset}`;
    }

    if (leftAndRight.includes(targetPosition)) {
      const xTargetDir = targetPosition === Position.Right ? -1 : 1;
      path += ` L ${cX},${cY}`;
      path += ` L ${targetX - xTargetDir * offset},${cY}`;
    } else {
      const yTargetDir = targetPosition === Position.Bottom ? -1 : 1;
      path += ` L ${cX},${targetY - yTargetDir * offset}`;
      path += ` L ${targetX},${targetY - yTargetDir * offset}`;
    }
  }

  path += ` L ${targetX},${targetY}`;

  return path;
}

export function getSmoothStepPath(params: SmoothStepPathParams): EdgePathResult {
  const {
    sourceX,
    sourceY,
    sourcePosition = Position.Bottom,
    targetX,
    targetY,
    targetPosition = Position.Top,
    offset = SMOOTH_STEP_PATH_OPTIONS.OFFSET,
    borderRadius = SMOOTH_STEP_PATH_OPTIONS.BORDER_RADIUS,
    stepPosition = SMOOTH_STEP_PATH_OPTIONS.STEP_POSITION,
  } = params;

  const path = getSmoothStepPathInternal({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius,
    offset,
    stepPosition,
  });

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const offsetX = Math.abs(targetX - sourceX) / 2;
  const offsetY = Math.abs(targetY - sourceY) / 2;

  return { path, labelX, labelY, offsetX, offsetY };
}

// ============================================================================
// Step Edge
// ============================================================================

export interface StepPathParams extends EdgePositionParams {
  offset?: number;
  stepPosition?: number;
}

export function getStepPath(params: StepPathParams): EdgePathResult {
  const {
    sourceX,
    sourceY,
    sourcePosition = Position.Bottom,
    targetX,
    targetY,
    targetPosition = Position.Top,
    offset = 20,
    stepPosition = 0.5,
  } = params;

  const leftAndRight = [Position.Left, Position.Right];

  let path = `M ${sourceX},${sourceY}`;

  if (leftAndRight.includes(sourcePosition)) {
    const midX = sourceX + (targetX - sourceX) * stepPosition;
    path += ` L ${midX},${sourceY} L ${midX},${targetY}`;
  } else {
    const midY = sourceY + (targetY - sourceY) * stepPosition;
    path += ` L ${sourceX},${midY} L ${targetX},${midY}`;
  }

  path += ` L ${targetX},${targetY}`;

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const offsetX = Math.abs(targetX - sourceX) / 2;
  const offsetY = Math.abs(targetY - sourceY) / 2;

  return { path, labelX, labelY, offsetX, offsetY };
}

// ============================================================================
// Straight Edge
// ============================================================================

export function getStraightPath(params: EdgePositionParams): EdgePathResult {
  const { sourceX, sourceY, targetX, targetY } = params;

  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const offsetX = Math.abs(targetX - sourceX) / 2;
  const offsetY = Math.abs(targetY - sourceY) / 2;

  return { path, labelX, labelY, offsetX, offsetY };
}

// ============================================================================
// Edge Path Factory
// ============================================================================

export function getEdgePath(
  type: string,
  params: EdgePositionParams & { pathOptions?: PathOptions }
): EdgePathResult {
  const { pathOptions, ...edgeParams } = params;

  switch (type) {
    case 'default':
    case 'bezier':
      return getBezierPath({
        ...edgeParams,
        curvature: pathOptions?.curvature,
      });
    case 'smoothstep':
      return getSmoothStepPath({
        ...edgeParams,
        offset: pathOptions?.offset,
        borderRadius: pathOptions?.borderRadius,
      });
    case 'step':
      return getStepPath({
        ...edgeParams,
        offset: pathOptions?.offset,
      });
    case 'straight':
      return getStraightPath(edgeParams);
    default:
      return getBezierPath(edgeParams);
  }
}

// ============================================================================
// Edge Center Calculation
// ============================================================================

export function getEdgeCenter(params: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}): [number, number, number, number] {
  const { sourceX, sourceY, targetX, targetY } = params;

  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;
  const offsetX = Math.abs(targetX - sourceX) / 2;
  const offsetY = Math.abs(targetY - sourceY) / 2;

  return [centerX, centerY, offsetX, offsetY];
}

// ============================================================================
// Get Opposite Position
// ============================================================================

export function getOppositePosition(position: Position): Position {
  switch (position) {
    case Position.Left:
      return Position.Right;
    case Position.Right:
      return Position.Left;
    case Position.Top:
      return Position.Bottom;
    case Position.Bottom:
      return Position.Top;
  }
}
