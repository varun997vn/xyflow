/**
 * Minimap component - shows overview of the flow
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { MinimapProps } from '../../types';
import { MINIMAP_DEFAULTS } from '../../constants';

@Component({
  selector: 'ngx-flow-minimap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-flow__minimap" [class]="'ngx-flow__minimap-' + position">
      <svg
        [attr.width]="width"
        [attr.height]="height"
        [attr.viewBox]="viewBox"
      >
        <!-- Nodes -->
        @for (node of nodes; track node.id) {
          <rect
            [attr.x]="node.positionAbsolute.x * scale"
            [attr.y]="node.positionAbsolute.y * scale"
            [attr.width]="(node.measured.width || 0) * scale"
            [attr.height]="(node.measured.height || 0) * scale"
            [attr.fill]="getNodeColor(node)"
            [attr.stroke]="getNodeStrokeColor(node)"
            [attr.stroke-width]="nodeStrokeWidth"
            [attr.rx]="nodeBorderRadius"
          />
        }

        <!-- Viewport Mask -->
        <rect
          [attr.x]="viewportX"
          [attr.y]="viewportY"
          [attr.width]="viewportWidth"
          [attr.height]="viewportHeight"
          [attr.fill]="maskColor"
          [attr.stroke]="maskStrokeColor"
          [attr.stroke-width]="maskStrokeWidth"
        />
      </svg>
    </div>
  `,
  styles: [`
    .ngx-flow__minimap {
      position: absolute;
      z-index: 10;
      background: white;
      border: 1px solid #e2e2e2;
      border-radius: 4px;
    }

    .ngx-flow__minimap-top-left {
      top: 10px;
      left: 10px;
    }

    .ngx-flow__minimap-top-right {
      top: 10px;
      right: 10px;
    }

    .ngx-flow__minimap-bottom-left {
      bottom: 10px;
      left: 10px;
    }

    .ngx-flow__minimap-bottom-right {
      bottom: 10px;
      right: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimapComponent implements MinimapProps {
  @Input() nodeColor: string | ((node: any) => string) = MINIMAP_DEFAULTS.NODE_COLOR;
  @Input() nodeStrokeColor: string | ((node: any) => string) = MINIMAP_DEFAULTS.NODE_STROKE_COLOR;
  @Input() nodeStrokeWidth = MINIMAP_DEFAULTS.NODE_STROKE_WIDTH;
  @Input() nodeBorderRadius = MINIMAP_DEFAULTS.NODE_BORDER_RADIUS;
  @Input() maskColor = MINIMAP_DEFAULTS.MASK_COLOR;
  @Input() maskStrokeColor = MINIMAP_DEFAULTS.MASK_STROKE_COLOR;
  @Input() maskStrokeWidth = MINIMAP_DEFAULTS.MASK_STROKE_WIDTH;
  @Input() position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right';

  private readonly flowService = inject(FlowService);

  readonly width = MINIMAP_DEFAULTS.WIDTH;
  readonly height = MINIMAP_DEFAULTS.HEIGHT;
  readonly scale = MINIMAP_DEFAULTS.SCALE;

  get nodes() {
    return this.flowService.internalNodes().filter(n => !n.hidden);
  }

  get viewBox(): string {
    return `0 0 ${this.width} ${this.height}`;
  }

  get viewportX(): number {
    const viewport = this.flowService.viewport();
    return -viewport.x * this.scale;
  }

  get viewportY(): number {
    const viewport = this.flowService.viewport();
    return -viewport.y * this.scale;
  }

  get viewportWidth(): number {
    const dimensions = this.flowService.dimensions();
    const viewport = this.flowService.viewport();
    return (dimensions.width / viewport.zoom) * this.scale;
  }

  get viewportHeight(): number {
    const dimensions = this.flowService.dimensions();
    const viewport = this.flowService.viewport();
    return (dimensions.height / viewport.zoom) * this.scale;
  }

  getNodeColor(node: any): string {
    return typeof this.nodeColor === 'function'
      ? this.nodeColor(node)
      : this.nodeColor;
  }

  getNodeStrokeColor(node: any): string {
    return typeof this.nodeStrokeColor === 'function'
      ? this.nodeStrokeColor(node)
      : this.nodeStrokeColor;
  }
}
