/**
 * Controls component - zoom and fit view controls
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'ngx-flow-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-flow__controls" [class]="'ngx-flow__controls-' + position">
      @if (showZoom) {
        <button
          class="ngx-flow__control-button"
          (click)="handleZoomIn()"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
        </button>
        <button
          class="ngx-flow__control-button"
          (click)="handleZoomOut()"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M3 8h10" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
        </button>
      }
      @if (showFitView) {
        <button
          class="ngx-flow__control-button"
          (click)="handleFitView()"
          title="Fit view"
          aria-label="Fit view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M2 6V2h4M14 6V2h-4M14 10v4h-4M2 10v4h4" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .ngx-flow__controls {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 10;
    }

    .ngx-flow__controls-top-left {
      top: 10px;
      left: 10px;
    }

    .ngx-flow__controls-top-right {
      top: 10px;
      right: 10px;
    }

    .ngx-flow__controls-bottom-left {
      bottom: 10px;
      left: 10px;
    }

    .ngx-flow__controls-bottom-right {
      bottom: 10px;
      right: 10px;
    }

    .ngx-flow__control-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e2e2;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      color: #555;
    }

    .ngx-flow__control-button:hover {
      background: #f5f5f5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .ngx-flow__control-button:active {
      background: #e8e8e8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent {
  @Input() showZoom = true;
  @Input() showFitView = true;
  @Input() position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-left';

  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() fitView = new EventEmitter<void>();

  private readonly viewportService = inject(ViewportService);

  handleZoomIn(): void {
    this.viewportService.zoomIn({ duration: 200 });
    this.zoomIn.emit();
  }

  handleZoomOut(): void {
    this.viewportService.zoomOut({ duration: 200 });
    this.zoomOut.emit();
  }

  handleFitView(): void {
    this.viewportService.fitView({ duration: 200, padding: 0.1 });
    this.fitView.emit();
  }
}
