/**
 * Handle component - connection point for nodes
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Position } from '../../types';

@Component({
  selector: 'ngx-flow-handle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ngx-flow__handle"
      [class]="handleClasses"
      [attr.data-handleid]="id || 'default'"
      [attr.data-handletype]="type"
      [attr.data-handlepos]="position"
    ></div>
  `,
  styles: [`
    .ngx-flow__handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #1a192b;
      border: 2px solid white;
      border-radius: 50%;
      cursor: crosshair;
      pointer-events: all;
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

    .ngx-flow__handle-source {
      background: #1a192b;
    }

    .ngx-flow__handle-target {
      background: #1a192b;
    }

    .ngx-flow__handle:hover {
      box-shadow: 0 0 0 3px rgba(26, 25, 43, 0.3);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandleComponent {
  @Input() id?: string;
  @Input() type: 'source' | 'target' = 'source';
  @Input() position: Position = Position.Top;
  @Input() isConnectable = true;

  get handleClasses(): string {
    const classes = [
      `ngx-flow__handle-${this.type}`,
      `ngx-flow__handle-${this.position}`,
    ];
    return classes.join(' ');
  }
}
