import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[libAutoTab]'
})
export class AutoTabDirective {
  @Input() libAutoTab;
  constructor() {}
  @HostListener('input', ['$event.target']) onInput(input) {
    const length = input.value.length;
    const maxLength = input.attributes.maxlength.value;

    if (length >= maxLength && this.libAutoTab) {
      const field = document.getElementById(this.libAutoTab);
      if (field) {
        field.focus();
      }
    }
  }
}
