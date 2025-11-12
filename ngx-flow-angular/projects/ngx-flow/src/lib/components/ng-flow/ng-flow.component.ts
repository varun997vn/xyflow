/**
 * Main NgxFlow component
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  effect,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { ViewportService } from '../../services/viewport.service';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Viewport,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  FitViewOptions,
  NodeOrigin,
  CoordinateExtent,
} from '../../types';
import { NodeWrapperComponent } from '../node-wrapper/node-wrapper.component';
import { EdgeWrapperComponent } from '../edge-wrapper/edge-wrapper.component';
import { BackgroundComponent } from '../background/background.component';
import { MinimapComponent } from '../minimap/minimap.component';
import { ControlsComponent } from '../controls/controls.component';
import { DEFAULT_VIEWPORT } from '../../constants';

@Component({
  selector: 'ngx-flow',
  standalone: true,
  imports: [
    CommonModule,
    NodeWrapperComponent,
    EdgeWrapperComponent,
    BackgroundComponent,
    MinimapComponent,
    ControlsComponent,
  ],
  providers: [FlowService, ViewportService],
  templateUrl: './ng-flow.component.html',
  styleUrls: ['./ng-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgFlowComponent implements OnInit, OnChanges, AfterViewInit {
  // ============================================================================
  // Inputs
  // ============================================================================

  @Input() nodes?: Node[];
  @Input() edges?: Edge[];
  @Input() defaultNodes?: Node[];
  @Input() defaultEdges?: Edge[];

  @Input() nodesDraggable = true;
  @Input() nodesConnectable = true;
  @Input() elementsSelectable = true;

  @Input() minZoom = 0.5;
  @Input() maxZoom = 2;
  @Input() defaultViewport?: Viewport;
  @Input() fitView = false;
  @Input() fitViewOptions?: FitViewOptions;

  @Input() snapToGrid = false;
  @Input() snapGrid: [number, number] = [15, 15];

  @Input() nodeOrigin: NodeOrigin = [0, 0];
  @Input() translateExtent?: CoordinateExtent;
  @Input() nodeExtent?: CoordinateExtent;

  @Input() zoomOnScroll = true;
  @Input() panOnScroll = false;
  @Input() panOnScrollSpeed = 1;
  @Input() zoomOnDoubleClick = true;

  @Input() deleteKeyCode: string | string[] = ['Backspace', 'Delete'];
  @Input() selectionKeyCode: string | string[] = ['Shift'];
  @Input() multiSelectionKeyCode: string | string[] = ['Meta', 'Control'];

  @Input() showBackground = false;
  @Input() showMinimap = false;
  @Input() showControls = false;

  // ============================================================================
  // Outputs
  // ============================================================================

  @Output() nodesChange = new EventEmitter<Node[]>();
  @Output() edgesChange = new EventEmitter<Edge[]>();
  @Output() onNodesChange = new EventEmitter<NodeChange[]>();
  @Output() onEdgesChange = new EventEmitter<EdgeChange[]>();
  @Output() onConnect = new EventEmitter<Connection>();
  @Output() onInit = new EventEmitter<any>();

  // ============================================================================
  // View References
  // ============================================================================

  @ViewChild('flowContainer', { static: true })
  flowContainer!: ElementRef<HTMLDivElement>;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(
    public flowService: FlowService,
    public viewportService: ViewportService
  ) {
    // Effect to emit nodes changes
    effect(() => {
      const nodes = this.flowService.nodes();
      this.nodesChange.emit(nodes);
    });

    // Effect to emit edges changes
    effect(() => {
      const edges = this.flowService.edges();
      this.edgesChange.emit(edges);
    });
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    // Initialize with default or provided nodes/edges
    if (this.nodes) {
      this.flowService.setNodes(this.nodes);
    } else if (this.defaultNodes) {
      this.flowService.setNodes(this.defaultNodes);
    }

    if (this.edges) {
      this.flowService.setEdges(this.edges);
    } else if (this.defaultEdges) {
      this.flowService.setEdges(this.defaultEdges);
    }

    // Set configuration
    this.flowService.setNodesDraggable(this.nodesDraggable);
    this.flowService.setNodesConnectable(this.nodesConnectable);
    this.flowService.setElementsSelectable(this.elementsSelectable);
    this.flowService.setMinZoom(this.minZoom);
    this.flowService.setMaxZoom(this.maxZoom);
    this.flowService.setSnapToGrid(this.snapToGrid);
    this.flowService.setSnapGrid(this.snapGrid);
    this.flowService.setNodeOrigin(this.nodeOrigin);

    if (this.translateExtent) {
      this.flowService.setTranslateExtent(this.translateExtent);
    }

    if (this.nodeExtent) {
      this.flowService.setNodeExtent(this.nodeExtent);
    }

    if (this.defaultViewport) {
      this.flowService.setViewport(this.defaultViewport);
    }
  }

  ngAfterViewInit(): void {
    // Measure container dimensions
    this.updateDimensions();

    // Fit view if requested
    if (this.fitView) {
      setTimeout(() => {
        this.viewportService.fitView(this.fitViewOptions);
      }, 0);
    }

    // Emit init event
    this.onInit.emit({
      viewportService: this.viewportService,
      flowService: this.flowService,
    });

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
    });

    resizeObserver.observe(this.flowContainer.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update nodes if controlled
    if (changes['nodes'] && this.nodes) {
      this.flowService.setNodes(this.nodes);
    }

    // Update edges if controlled
    if (changes['edges'] && this.edges) {
      this.flowService.setEdges(this.edges);
    }

    // Update configuration
    if (changes['nodesDraggable']) {
      this.flowService.setNodesDraggable(this.nodesDraggable);
    }

    if (changes['nodesConnectable']) {
      this.flowService.setNodesConnectable(this.nodesConnectable);
    }

    if (changes['elementsSelectable']) {
      this.flowService.setElementsSelectable(this.elementsSelectable);
    }

    if (changes['minZoom']) {
      this.flowService.setMinZoom(this.minZoom);
    }

    if (changes['maxZoom']) {
      this.flowService.setMaxZoom(this.maxZoom);
    }

    if (changes['snapToGrid']) {
      this.flowService.setSnapToGrid(this.snapToGrid);
    }

    if (changes['snapGrid']) {
      this.flowService.setSnapGrid(this.snapGrid);
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  onWheel(event: WheelEvent): void {
    if (this.zoomOnScroll && !event.shiftKey) {
      this.viewportService.handleZoomOnScroll(event);
    } else if (this.panOnScroll || event.shiftKey) {
      this.viewportService.handlePanOnScroll(event, this.panOnScrollSpeed);
    }
  }

  onPaneClick(event: MouseEvent): void {
    // Deselect all on pane click
    const selectedNodes = this.flowService.selectedNodes();
    const selectedEdges = this.flowService.selectedEdges();

    if (selectedNodes.length > 0) {
      const changes: NodeChange[] = selectedNodes.map(node => ({
        type: 'select',
        id: node.id,
        selected: false,
      }));
      this.flowService.applyNodeChanges(changes);
      this.onNodesChange.emit(changes);
    }

    if (selectedEdges.length > 0) {
      const changes: EdgeChange[] = selectedEdges.map(edge => ({
        type: 'select',
        id: edge.id,
        selected: false,
      }));
      this.flowService.applyEdgeChanges(changes);
      this.onEdgesChange.emit(changes);
    }
  }

  onPaneDoubleClick(event: MouseEvent): void {
    if (this.zoomOnDoubleClick) {
      this.viewportService.zoomIn({ duration: 200 });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const deleteKeys = Array.isArray(this.deleteKeyCode)
      ? this.deleteKeyCode
      : [this.deleteKeyCode];

    if (deleteKeys.includes(event.key)) {
      this.deleteSelectedElements();
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private updateDimensions(): void {
    if (this.flowContainer) {
      const rect = this.flowContainer.nativeElement.getBoundingClientRect();
      this.flowService.setDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }

  private deleteSelectedElements(): void {
    const selectedNodes = this.flowService.selectedNodes();
    const selectedEdges = this.flowService.selectedEdges();

    const nodeChanges: NodeChange[] = selectedNodes
      .filter(n => n.deletable !== false)
      .map(node => ({
        type: 'remove',
        id: node.id,
      }));

    const edgeChanges: EdgeChange[] = selectedEdges
      .filter(e => e.deletable !== false)
      .map(edge => ({
        type: 'remove',
        id: edge.id,
      }));

    if (nodeChanges.length > 0) {
      this.flowService.applyNodeChanges(nodeChanges);
      this.onNodesChange.emit(nodeChanges);
    }

    if (edgeChanges.length > 0) {
      this.flowService.applyEdgeChanges(edgeChanges);
      this.onEdgesChange.emit(edgeChanges);
    }
  }

  // ============================================================================
  // Template Helpers
  // ============================================================================

  get transform(): string {
    const [x, y, zoom] = this.flowService.transform();
    return `translate(${x}px, ${y}px) scale(${zoom})`;
  }

  get visibleNodes() {
    return this.flowService.visibleNodes();
  }

  get internalEdges() {
    return this.flowService.internalEdges();
  }
}
