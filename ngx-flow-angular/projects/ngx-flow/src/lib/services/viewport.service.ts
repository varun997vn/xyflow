/**
 * Viewport service - handles pan and zoom operations
 */

import { Injectable, inject } from '@angular/core';
import { FlowService } from './flow.service';
import {
  Viewport,
  Transform,
  Rect,
  XYPosition,
  PanZoomOptions,
  FitViewOptions,
} from '../types';
import {
  getNodesBounds,
  getViewportForBounds,
  clamp,
  screenToFlowPosition,
  flowToScreenPosition,
} from '../utils';
import { ANIMATION_DURATION } from '../constants';

@Injectable()
export class ViewportService {
  private readonly flowService = inject(FlowService);
  private isAnimating = false;

  // ============================================================================
  // Zoom Operations
  // ============================================================================

  /**
   * Zooms in by 10%
   */
  async zoomIn(options?: PanZoomOptions): Promise<boolean> {
    const currentZoom = this.flowService.viewport().zoom;
    const maxZoom = this.flowService.maxZoom();
    const newZoom = Math.min(currentZoom * 1.1, maxZoom);

    return this.zoomTo(newZoom, options);
  }

  /**
   * Zooms out by 10%
   */
  async zoomOut(options?: PanZoomOptions): Promise<boolean> {
    const currentZoom = this.flowService.viewport().zoom;
    const minZoom = this.flowService.minZoom();
    const newZoom = Math.max(currentZoom / 1.1, minZoom);

    return this.zoomTo(newZoom, options);
  }

  /**
   * Zooms to a specific zoom level
   */
  async zoomTo(zoom: number, options?: PanZoomOptions): Promise<boolean> {
    const viewport = this.flowService.viewport();
    const dimensions = this.flowService.dimensions();
    const minZoom = this.flowService.minZoom();
    const maxZoom = this.flowService.maxZoom();

    const clampedZoom = clamp(zoom, minZoom, maxZoom);

    if (clampedZoom === viewport.zoom) {
      return false;
    }

    // Zoom towards center
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const scale = clampedZoom / viewport.zoom;

    const newX = centerX - (centerX - viewport.x) * scale;
    const newY = centerY - (centerY - viewport.y) * scale;

    const newViewport: Viewport = {
      x: newX,
      y: newY,
      zoom: clampedZoom,
    };

    return this.setViewport(newViewport, options);
  }

  /**
   * Zooms by a factor
   */
  async zoomBy(factor: number, options?: PanZoomOptions): Promise<boolean> {
    const currentZoom = this.flowService.viewport().zoom;
    return this.zoomTo(currentZoom * factor, options);
  }

  // ============================================================================
  // Pan Operations
  // ============================================================================

  /**
   * Pans the viewport by a delta
   */
  async panBy(delta: XYPosition, options?: PanZoomOptions): Promise<boolean> {
    const viewport = this.flowService.viewport();

    const newViewport: Viewport = {
      x: viewport.x + delta.x,
      y: viewport.y + delta.y,
      zoom: viewport.zoom,
    };

    return this.setViewport(newViewport, options);
  }

  /**
   * Sets the center of the viewport to a specific point
   */
  async setCenter(
    x: number,
    y: number,
    options?: PanZoomOptions
  ): Promise<boolean> {
    const viewport = this.flowService.viewport();
    const dimensions = this.flowService.dimensions();

    const newViewport: Viewport = {
      x: dimensions.width / 2 - x * viewport.zoom,
      y: dimensions.height / 2 - y * viewport.zoom,
      zoom: viewport.zoom,
    };

    return this.setViewport(newViewport, options);
  }

  // ============================================================================
  // Fit View
  // ============================================================================

  /**
   * Fits the view to show all nodes
   */
  async fitView(options?: FitViewOptions): Promise<boolean> {
    const {
      padding = 0.1,
      includeHiddenNodes = false,
      minZoom,
      maxZoom,
      nodes: nodeFilter,
      duration,
    } = options || {};

    let nodes = this.flowService.internalNodes();

    if (!includeHiddenNodes) {
      nodes = nodes.filter(n => !n.hidden);
    }

    if (nodeFilter) {
      const nodeIds = new Set(nodeFilter.map(n => n.id));
      nodes = nodes.filter(n => nodeIds.has(n.id));
    }

    if (nodes.length === 0) {
      return false;
    }

    const dimensions = this.flowService.dimensions();
    const nodeOrigin = this.flowService.nodeOrigin();
    const bounds = getNodesBounds(nodes, nodeOrigin);

    const minZ = minZoom ?? this.flowService.minZoom();
    const maxZ = maxZoom ?? this.flowService.maxZoom();

    const viewport = getViewportForBounds(
      bounds,
      dimensions.width,
      dimensions.height,
      minZ,
      maxZ,
      padding
    );

    return this.setViewport(viewport, { duration });
  }

  /**
   * Fits the viewport to specific bounds
   */
  async fitBounds(bounds: Rect, options?: PanZoomOptions): Promise<boolean> {
    const dimensions = this.flowService.dimensions();
    const minZoom = this.flowService.minZoom();
    const maxZoom = this.flowService.maxZoom();

    const viewport = getViewportForBounds(
      bounds,
      dimensions.width,
      dimensions.height,
      minZoom,
      maxZoom,
      0.1
    );

    return this.setViewport(viewport, options);
  }

  // ============================================================================
  // Viewport Setters
  // ============================================================================

  /**
   * Sets the viewport with optional animation
   */
  async setViewport(
    viewport: Viewport,
    options?: PanZoomOptions
  ): Promise<boolean> {
    const { duration = 0 } = options || {};

    // Clamp zoom
    const minZoom = this.flowService.minZoom();
    const maxZoom = this.flowService.maxZoom();
    const clampedViewport = {
      ...viewport,
      zoom: clamp(viewport.zoom, minZoom, maxZoom),
    };

    // Apply translate extent constraints
    const translateExtent = this.flowService.translateExtent();
    const dimensions = this.flowService.dimensions();

    const [[minX, minY], [maxX, maxY]] = translateExtent;

    // Clamp viewport position
    const clampedX = clamp(
      clampedViewport.x,
      dimensions.width - maxX * clampedViewport.zoom,
      -minX * clampedViewport.zoom
    );

    const clampedY = clamp(
      clampedViewport.y,
      dimensions.height - maxY * clampedViewport.zoom,
      -minY * clampedViewport.zoom
    );

    const finalViewport: Viewport = {
      x: clampedX,
      y: clampedY,
      zoom: clampedViewport.zoom,
    };

    if (duration > 0 && !this.isAnimating) {
      return this.animateViewport(finalViewport, duration);
    } else {
      this.flowService.setViewport(finalViewport);
      return true;
    }
  }

  // ============================================================================
  // Coordinate Transformations
  // ============================================================================

  /**
   * Converts screen position to flow position
   */
  screenToFlowPosition(position: XYPosition): XYPosition {
    const transform = this.flowService.transform();
    const snapToGrid = this.flowService.snapToGrid();
    const snapGrid = this.flowService.snapGrid();

    return screenToFlowPosition(position, transform, snapToGrid, snapGrid);
  }

  /**
   * Converts flow position to screen position
   */
  flowToScreenPosition(position: XYPosition): XYPosition {
    const transform = this.flowService.transform();
    return flowToScreenPosition(position, transform);
  }

  /**
   * Alias for screenToFlowPosition
   */
  project(position: XYPosition): XYPosition {
    return this.screenToFlowPosition(position);
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getViewport(): Viewport {
    return this.flowService.viewport();
  }

  getTransform(): Transform {
    return this.flowService.transform();
  }

  // ============================================================================
  // Private Animation
  // ============================================================================

  private async animateViewport(
    targetViewport: Viewport,
    duration: number
  ): Promise<boolean> {
    this.isAnimating = true;
    const startViewport = this.flowService.viewport();
    const startTime = Date.now();

    return new Promise<boolean>(resolve => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        const currentViewport: Viewport = {
          x: startViewport.x + (targetViewport.x - startViewport.x) * eased,
          y: startViewport.y + (targetViewport.y - startViewport.y) * eased,
          zoom:
            startViewport.zoom +
            (targetViewport.zoom - startViewport.zoom) * eased,
        };

        this.flowService.setViewport(currentViewport);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve(true);
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // ============================================================================
  // Zoom on Scroll
  // ============================================================================

  /**
   * Handles zoom on scroll events
   */
  handleZoomOnScroll(event: WheelEvent, zoomSpeed = 0.5): void {
    event.preventDefault();

    const viewport = this.flowService.viewport();
    const dimensions = this.flowService.dimensions();

    const delta = -event.deltaY * 0.01 * zoomSpeed;
    const scale = 1 + delta;

    const minZoom = this.flowService.minZoom();
    const maxZoom = this.flowService.maxZoom();

    const newZoom = clamp(viewport.zoom * scale, minZoom, maxZoom);

    if (newZoom === viewport.zoom) {
      return;
    }

    // Get mouse position relative to the viewport
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate new viewport position to zoom towards mouse
    const zoomRatio = newZoom / viewport.zoom;

    const newX = mouseX - (mouseX - viewport.x) * zoomRatio;
    const newY = mouseY - (mouseY - viewport.y) * zoomRatio;

    this.setViewport({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  }

  /**
   * Handles pan on scroll events
   */
  handlePanOnScroll(event: WheelEvent, speed = 1): void {
    event.preventDefault();

    this.panBy({
      x: -event.deltaX * speed,
      y: -event.deltaY * speed,
    });
  }
}
