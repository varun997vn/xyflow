/**
 * Node wrapper component - renders individual nodes
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalNode, NodeChange } from '../../types';
import { FlowService } from '../../services/flow.service';

@Component({
  selector: 'ngx-flow-node-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ngx-flow__node"
      [class.selected]="node.selected"
      [class.dragging]="node.dragging"
      [style.transform]="nodeTransform"
      [style.z-index]="node.internals.z"
      [style.pointer-events]="'all'"
      (click)="onClick($event)"
      (mousedown)="onMouseDown($event)"
    >
      <div class="ngx-flow__node-default">
        <div class="ngx-flow__node-label">
          {{ node.data?.label || node.id }}
        </div>

        <!-- Handles -->
        @if (node.connectable !== false) {
          <div class="ngx-flow__handle ngx-flow__handle-target ngx-flow__handle-top"
               data-handleid="target"
               data-handletype="target"
               data-handlepos="top"></div>
          <div class="ngx-flow__handle ngx-flow__handle-source ngx-flow__handle-bottom"
               data-handleid="source"
               data-handletype="source"
               data-handlepos="bottom"></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ngx-flow__node {
      position: absolute;
      transform-origin: 0 0;
      cursor: pointer;
      user-select: none;
    }

    .ngx-flow__node.selected .ngx-flow__node-default {
      box-shadow: 0 0 0 2px #1a192b;
    }

    .ngx-flow__node.dragging {
      opacity: 0.8;
    }

    .ngx-flow__node-default {
      padding: 10px 20px;
      border-radius: 3px;
      background: white;
      border: 1px solid #1a192b;
      transition: box-shadow 0.2s;
    }

    .ngx-flow__node-label {
      font-size: 12px;
      color: #222;
    }

    .ngx-flow__handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #1a192b;
      border: 2px solid white;
      border-radius: 50%;
      cursor: crosshair;
    }

    .ngx-flow__handle-top {
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
    }

    .ngx-flow__handle-bottom {
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
    }

    .ngx-flow__handle-left {
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
    }

    .ngx-flow__handle-right {
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeWrapperComponent implements AfterViewInit {
  @Input() node!: InternalNode;

  private readonly flowService = inject(FlowService);
  private readonly elementRef = inject(ElementRef);
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    // Measure node dimensions
    this.measureNode();

    // Set up ResizeObserver to track dimension changes
    const resizeObserver = new ResizeObserver(() => {
      this.measureNode();
    });

    resizeObserver.observe(this.elementRef.nativeElement);
  }

  get nodeTransform(): string {
    const { positionAbsolute } = this.node;
    return `translate(${positionAbsolute.x}px, ${positionAbsolute.y}px)`;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.flowService.elementsSelectable()) {
      return;
    }

    const change: NodeChange = {
      type: 'select',
      id: this.node.id,
      selected: !this.node.selected,
    };

    this.flowService.applyNodeChanges([change]);
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only left click

    event.stopPropagation();

    if (!this.flowService.nodesDraggable() || this.node.draggable === false) {
      return;
    }

    this.isDragging = true;
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const deltaX = (e.clientX - this.dragStart.x) / this.flowService.viewport().zoom;
      const deltaY = (e.clientY - this.dragStart.y) / this.flowService.viewport().zoom;

      const newPosition = {
        x: this.node.position.x + deltaX,
        y: this.node.position.y + deltaY,
      };

      const change: NodeChange = {
        type: 'position',
        id: this.node.id,
        position: newPosition,
        dragging: true,
      };

      this.flowService.applyNodeChanges([change]);

      this.dragStart = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const onMouseUp = () => {
      if (this.isDragging) {
        this.isDragging = false;

        const change: NodeChange = {
          type: 'position',
          id: this.node.id,
          dragging: false,
        };

        this.flowService.applyNodeChanges([change]);
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private measureNode(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();

    const change: NodeChange = {
      type: 'dimensions',
      id: this.node.id,
      dimensions: {
        width: rect.width,
        height: rect.height,
      },
    };

    this.flowService.applyNodeChanges([change]);
  }
}
