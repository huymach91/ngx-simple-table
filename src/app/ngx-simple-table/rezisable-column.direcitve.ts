import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[resizable-column]',
})
export class ResizableColumnDirective implements AfterViewInit {
  private table: HTMLTableElement;
  private columns: NodeList;
  private currentResizer: HTMLDivElement | any;
  private currentCell: HTMLTableCellElement | any;
  private currentCellWidth: number | any;
  private currentPageX: number | any;
  private siblingCell: HTMLTableCellElement | any;
  private siblingCellWidth: number | any;
  private isMouseDown: boolean | any;

  @Output('onChange') onChange = new EventEmitter();

  constructor(private element: ElementRef) {
    this.table = this.element.nativeElement;
  }

  ngAfterViewInit() {
    this.init();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown || !this.currentResizer) return;
    this.resize(event);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.currentResizer) {
      this.updateCurrentResizerHeight();
    }
    this.currentCell = null;
    this.siblingCell = null;
    this.currentResizer = null;
    this.siblingCellWidth = null;
    this.currentPageX = null;
  }

  private init() {
    this.columns = this.table.querySelectorAll('thead tr th');
    this.columns.forEach((column: any, index: number) => {
      if (index === this.columns.length - 1) return;
      const resizer = this.createResizer();
      if (!column.className.includes('fixed-column')) {
        column.style.setProperty('position', 'relative');
        column.appendChild(resizer);
      }
    });
  }

  private createResizer(): HTMLDivElement {
    const resizer = document.createElement('div');
    resizer.style.setProperty('width', '3px');
    resizer.style.setProperty('position', 'absolute');
    resizer.style.setProperty('background-color', 'transparent');
    resizer.style.setProperty('top', '0');
    resizer.style.setProperty('cursor', 'col-resize');
    resizer.style.setProperty('right', '-1px');
    resizer.style.setProperty('z-index', '3');
    resizer.style.setProperty('height', this.table.offsetHeight + 'px');
    resizer.onmousedown = (mdEvent) => {
      this.isMouseDown = true;
      this.currentResizer = resizer;
      this.currentCell = resizer.parentElement as HTMLTableCellElement;
      this.siblingCell = this.currentCell
        .nextElementSibling as HTMLTableCellElement;
      this.currentPageX = mdEvent.pageX;
      this.currentCellWidth = this.currentCell.offsetWidth;
      if (this.siblingCell) {
        this.siblingCellWidth = this.siblingCell.offsetWidth;
      }
    };
    resizer.onmouseover = () => {
      this.highlightResizer(resizer);
    };
    resizer.onmouseleave = () => {
      this.stopHighlightResizer(resizer);
    };
    resizer.ondblclick = (event: any) => {
      this.currentCell = event.target.parentElement;
      this.autoHeight();
    };
    return resizer;
  }

  private resize(event: MouseEvent) {
    if (this.currentCell) {
      this.updateCurrentResizerHeight();
      var diffX = event.pageX - this.currentPageX;
      if (this.siblingCell) {
        this.siblingCell.style.width = this.siblingCellWidth - diffX + 'px';
        this.currentCell.style.width = this.currentCellWidth + diffX + 'px';
      }
      this.emitNewColumnWidth();
    }
  }

  private updateCurrentResizerHeight() {
    this.currentResizer.style.setProperty(
      'height',
      this.table.offsetHeight + 'px'
    );
  }

  private autoHeight() {
    if (!this.currentCell) return;
    this.currentCell.style.setProperty('width', 'auto');
    this.emitNewColumnWidth();
  }

  private highlightResizer(resizer: HTMLDivElement) {
    resizer.style.setProperty('background-color', '#3eb8ff');
  }

  private stopHighlightResizer(resizer: HTMLDivElement) {
    resizer.style.setProperty('background-color', 'transparent');
  }

  private emitNewColumnWidth() {
    const newWidths = Array.from(this.columns).map(
      (element: any) => element.offsetWidth
    );
    this.onChange.emit(newWidths);
  }
}
