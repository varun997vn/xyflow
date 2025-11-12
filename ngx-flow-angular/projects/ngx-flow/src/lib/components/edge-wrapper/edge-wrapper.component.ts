/**
 * Edge wrapper component - renders individual edges
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  inject,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalEdge, Position } from '../../types';
import { FlowService } from '../../services/flow.service';
import { getBezierPath } from '../../utils';

@Component({
  selector: 'g[ngx-flow-edge-wrapper]',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (edgePath) {
        <!-- Edge Path -->
        <path
          class="ngx-flow__edge-path"
          [attr.d]="edgePath.path"
          [attr.marker-end]="markerEnd"
          [attr.stroke]="edge.style?.stroke || '#b1b1b7'"
          [attr.stroke-width]="edge.style?.strokeWidth || 2"
          fill="none"
          [style.pointer-events]="'all'"
        />

        <!-- Interaction Path (wider, invisible) -->
        <path
          [attr.d]="edgePath.path"
          stroke="transparent"
          [attr.stroke-width]="edge.interactionWidth || 20"
          fill="none"
          [style.pointer-events]="'all'"
          [style.cursor]="'pointer'"
        />

        <!-- Edge Label -->
        @if (edge.label) {
          <text
            [attr.x]="edgePath.labelX"
            [attr.y]="edgePath.labelY"
            class="ngx-flow__edge-label"
            text-anchor="middle"
            dominant-baseline="middle"
            [attr.fill]="edge.labelStyle?.fill || '#555'"
            [attr.font-size]="edge.labelStyle?.fontSize || '12px'"
            [style.pointer-events]="'none'"
          >
            {{ edge.label }}
          </text>
        }
    }
  `,
  host: {
    'class': 'ngx-flow__edge',
    '[class.selected]': 'edge.selected',
    '[class.animated]': 'edge.animated',
    '[attr.data-edge-id]': 'edge.id',
    '(click)': 'onClick($event)'
  },
  styles: [`
    .ngx-flow__edge {
      pointer-events: all;
    }

    .ngx-flow__edge.selected .ngx-flow__edge-path {
      stroke: #555 !important;
    }

    .ngx-flow__edge.animated .ngx-flow__edge-path {
      stroke-dasharray: 5;
      animation: dashdraw 0.5s linear infinite;
    }

    @keyframes dashdraw {
      from {
        stroke-dashoffset: 10;
      }
    }

    .ngx-flow__edge-label {
      user-select: none;
      pointer-events: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [NO_ERRORS_SCHEMA],
})
export class EdgeWrapperComponent {
  @Input() edge!: InternalEdge;

  private readonly flowService = inject(FlowService);

  get edgePath() {
    const nodeLookup = this.flowService.nodeLookup();
    const sourceNode = nodeLookup.get(this.edge.source);
    const targetNode = nodeLookup.get(this.edge.target);

    if (!sourceNode || !targetNode) {
      return null;
    }

    // Simple edge positioning - center to center
    const sourceX = sourceNode.positionAbsolute.x + (sourceNode.measured.width || 0) / 2;
    const sourceY = sourceNode.positionAbsolute.y + (sourceNode.measured.height || 0);
    const targetX = targetNode.positionAbsolute.x + (targetNode.measured.width || 0) / 2;
    const targetY = targetNode.positionAbsolute.y;

    return getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Bottom,
      targetX,
      targetY,
      targetPosition: Position.Top,
      curvature: this.edge.pathOptions?.curvature,
    });
  }

  get markerEnd(): string {
    if (this.edge.markerEnd) {
      return typeof this.edge.markerEnd === 'string'
        ? this.edge.markerEnd
        : 'url(#ngx-flow-arrowclosed)';
    }
    return 'url(#ngx-flow-arrowclosed)';
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.flowService.elementsSelectable()) {
      return;
    }

    this.flowService.applyEdgeChanges([
      {
        type: 'select',
        id: this.edge.id,
        selected: !this.edge.selected,
      },
    ]);
  }
}
