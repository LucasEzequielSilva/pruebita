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

  readonly minHeight = 100; // Altura mínima permitida
  readonly maxHeight = 75; // Altura máxima permitida (en vh)
  readonly openThreshold = 1; // Ajusta según tus necesidades
  readonly closedThreshold = 1; // Puedes ajustar según tus necesidades
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

  onDragStart(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.startY = event.clientY;
    // Establecer la altura inicial como la altura actual del bottomSheet
    this.initialHeight = this.bottomSheet.nativeElement.clientHeight;
    console.log("arranca", this.startY, this.initialHeight);
  }
  

  onDragMove(event: MouseEvent): void {
    if (this.isDragging) {
      const mouseY = event.clientY;
    
      // Calcular la posición relativa del mouse en el viewport
      const relativePosition = mouseY / window.innerHeight;
    
      // Calcular la nueva altura en base a la posición relativa y los límites
      const newHeight = window.innerHeight - mouseY; // Puedes ajustar esto según tus necesidades
    
      // Limitar la altura superior e inferior
      const clampedHeight = Math.max(this.minHeight, Math.min(newHeight, window.innerHeight - this.minHeight));
    
      // Aplicar el cambio de altura al elemento #bottomSheet
      this.bottomSheet.nativeElement.style.height = `${clampedHeight}px`;
  
      // Verificar si se está realizando un arrastre para aplicar animación
      if (this.isDragging) {
        console.log("moviendo");
      }
    }
  }
  
onDragEnd(event: MouseEvent): void {
  if (this.isDragging) {
    this.isDragging = false;

    // Calcular la diferencia entre la posición inicial y final del drag
    const dragDistance = this.startY - event.clientY;

    // Determinar si el arrastre fue hacia arriba o hacia abajo
    const isDragUp = dragDistance > 0;

    // Calcular la altura final basada en la dirección del arrastre y el estado actual
    let finalHeight: number;

    // Verificar si se cumple el closedThreshold para cerrar
    if (!isDragUp && dragDistance > this.closedThreshold) {
      finalHeight = this.minHeight;
    } else {
      const isOpen = this.bottomSheet.nativeElement.clientHeight > this.minHeight;
      finalHeight = isDragUp ? window.innerHeight : (isOpen ? window.innerHeight : this.minHeight);
    }

    // Animar o establecer la altura sin animación según sea necesario
    if ((isDragUp && !(this.bottomSheet.nativeElement.clientHeight > this.minHeight)) || (!isDragUp && (this.bottomSheet.nativeElement.clientHeight > this.minHeight))) {
      this.animateHeight(this.bottomSheet.nativeElement.clientHeight, finalHeight);
    } else {
      this.bottomSheet.nativeElement.style.height = `${finalHeight}px`;
    }

    console.log("termina");
  }
}
       
  animateHeight(startHeight: number, targetHeight: number): void {
    const duration = 300; // Duración de la animación en milisegundos
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
