import { Component, OnInit, Input, Output, EventEmitter, HostListener, SimpleChanges } from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition(':enter', [animate('200ms ease-out')]),
      transition(':leave', [animate('200ms ease-in')]),
    ]),
  ],
})

export class MultiSelectComponent implements OnInit {
  @Input() title: string = 'Seleccionar';
  @Input() products: { portal_publication_id: number; product_name: string; selected?: boolean }[] = [];
  @Output() selectedChange = new EventEmitter<{ portal_publication_id: number; product_name: string; selected?: boolean }[]>();

  isOpen = false;

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.multi-select-dropdown')) {
      this.isOpen = false; // We close the dropdown if the click was outside of it
    }
  }

  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.products) {
      this.products.forEach(product => product.selected = false);
    }
  }

  get selectedCount(): number {
    return this.products.filter(product => product.selected).length;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  toggleSelection(product: any) {
    product.selected = !product.selected;
    this.emitSelected();
  }

  clearSelection(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing on click
    this.products.forEach(product => (product.selected = false));
    this.emitSelected();
  }

  emitSelected() {
    const selectedItems = this.products.filter(product => product.selected);
    this.selectedChange.emit(selectedItems); // We issue the selected items
  }

  truncateText(text: string): string {
    if (text.length > 22) {
      return text.substring(0, 22) + '...';
    }
    return text;
  }

  ngOnInit() {
  }
}
