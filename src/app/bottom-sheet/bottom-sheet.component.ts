import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'my-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent {
  private isDragging = false;
  private startY = 30;
  private initialHeight = 30;

  readonly minHeight = 100;
  readonly openThreshold = 1;
  readonly closedThreshold = 1;
  @ViewChild('bottomSheet', { static: true }) bottomSheet!: ElementRef;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    this.onDragMove(event);
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    this.onDragEnd(event);
  }

  @HostListener('document:touchmove', ['$event'])
  onDocumentTouchMove(event: TouchEvent): void {
    if (event.touches && event.touches.length === 1) {
      this.onDragMove(event.touches[0]);
      event.preventDefault();
    }
  }

  @HostListener('document:touchend', ['$event'])
  onDocumentTouchEnd(event: TouchEvent): void {
    if (event.touches && event.touches.length === 1) {
      this.onDragEnd(event.touches[0]);
      event.preventDefault();
    }
  }

  onDragStart(event: MouseEvent | Touch): void {
    this.isDragging = true;
    this.startY = ('clientY' in event ? event.clientY : (event as Touch).clientY) || 0;
    this.initialHeight = this.bottomSheet.nativeElement.clientHeight;
    console.log("arranca", this.startY, this.initialHeight);
  }

  onDragMove(event: MouseEvent | Touch): void {
    if (this.isDragging) {
      const mouseY = ('clientY' in event ? event.clientY : (event as Touch).clientY) || 0;
      const newHeight = window.innerHeight - mouseY;
      const clampedHeight = Math.max(this.minHeight, Math.min(newHeight, window.innerHeight - this.minHeight));
      this.bottomSheet.nativeElement.style.height = `${clampedHeight}px`;

      if (this.isDragging) {
        console.log("moviendo");
      }
    }
  }

  onDragEnd(event: MouseEvent | Touch): void {
    if (this.isDragging) {
      this.isDragging = false;
      const dragDistance = this.startY - ('clientY' in event ? event.clientY : (event as Touch).clientY) || 0;
      const isDragUp = dragDistance > 0;
      let finalHeight: number;

      if (!isDragUp && dragDistance > this.closedThreshold) {
        finalHeight = this.minHeight;
      } else {
        const isOpen = this.bottomSheet.nativeElement.clientHeight > this.minHeight;
        finalHeight = isDragUp ? window.innerHeight : (isOpen ? window.innerHeight : this.minHeight);
      }

      if ((isDragUp && !(this.bottomSheet.nativeElement.clientHeight > this.minHeight)) || (!isDragUp && (this.bottomSheet.nativeElement.clientHeight > this.minHeight))) {
        this.animateHeight(this.bottomSheet.nativeElement.clientHeight, finalHeight);
      } else {
        this.bottomSheet.nativeElement.style.height = `${finalHeight}px`;
      }

      console.log("termina");
    }
  }

  animateHeight(startHeight: number, targetHeight: number): void {
    const duration = 300;
    const startTime = performance.now();

    const animate = (time: number) => {
      let progress = (time - startTime) / duration;

      if (progress > 1) {
        progress = 1;
      }

      const easing = progress > .5 ? 1 - Math.sqrt(1 - (progress * 2 - 2) ** 2) : (progress * 2) ** 2 / 2;
      const newHeight = startHeight + (targetHeight - startHeight) * easing;

      this.bottomSheet.nativeElement.style.height = `${newHeight}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}
