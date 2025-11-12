/**
 * Background component - renders grid/dots pattern
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
import { BackgroundVariant } from '../../types';

@Component({
  selector: 'ngx-flow-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="ngx-flow__background" [style]="backgroundStyle">
      <pattern
        [id]="patternId"
        [attr.x]="patternOffset.x"
        [attr.y]="patternOffset.y"
        [attr.width]="scaledGap"
        [attr.height]="scaledGap"
        patternUnits="userSpaceOnUse"
      >
        @if (variant === 'dots') {
          <circle
            [attr.cx]="scaledGap / 2"
            [attr.cy]="scaledGap / 2"
            [attr.r]="size"
            [attr.fill]="color"
          />
        } @else if (variant === 'lines') {
          <path
            [attr.d]="linesPath"
            [attr.stroke]="color"
            [attr.stroke-width]="size"
          />
        } @else if (variant === 'cross') {
          <path
            [attr.d]="crossPath"
            [attr.stroke]="color"
            [attr.stroke-width]="size"
          />
        }
      </pattern>
      <rect width="100%" height="100%" [attr.fill]="fillPattern" />
    </svg>
  `,
  styles: [`
    .ngx-flow__background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  @Input() variant: BackgroundVariant = BackgroundVariant.Dots;
  @Input() gap: number | [number, number] = 20;
  @Input() size = 1;
  @Input() color = '#81818a';
  @Input() style?: any;

  private readonly flowService = inject(FlowService);

  readonly patternId = 'ngx-flow-pattern';

  get backgroundStyle() {
    return this.style || {};
  }

  get scaledGap(): number {
    const gapValue = Array.isArray(this.gap) ? this.gap[0] : this.gap;
    return gapValue * this.flowService.viewport().zoom;
  }

  get patternOffset() {
    const viewport = this.flowService.viewport();
    return {
      x: viewport.x % this.scaledGap,
      y: viewport.y % this.scaledGap,
    };
  }

  get linesPath(): string {
    return `M ${this.scaledGap} 0 L 0 0 0 ${this.scaledGap}`;
  }

  get crossPath(): string {
    const half = this.scaledGap / 2;
    return `M ${half} 0 L ${half} ${this.scaledGap} M 0 ${half} L ${this.scaledGap} ${half}`;
  }

  get fillPattern(): string {
    return `url(#${this.patternId})`;
  }
}
