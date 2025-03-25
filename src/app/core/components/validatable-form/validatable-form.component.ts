import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-validatable-form',
  templateUrl: './validatable-form.component.html',
  styleUrls: ['./validatable-form.component.scss'],
})
export class ValidatableFormComponent implements OnInit {


  constructor(private elementRef:ElementRef) { }

  ngOnInit() {}

  clear() {
    var d1 = this.elementRef.nativeElement.querySelectorAll('.input-alert');
    for(let a of d1)
    {
      a.remove();
    }
  }



  validate(e: any) {
    var d1 = this.elementRef.nativeElement.querySelectorAll('[name], [secondName]');
    for(let a of d1)
    {
      const name = a.getAttribute('name');
      const secondName = a.getAttribute('secondName');
      if(name && e.error?.errors.hasOwnProperty(name))
      {

        this.insertAfter(e.error?.errors[name].join(", "), a);

      }

      if(secondName && e.error?.errors.hasOwnProperty(secondName))
      {

        this.insertAfter(e.error?.errors[secondName].join(", "), a);

      }
    }
  }

  insertAfter(message, referenceElement) {
    var newElement = document.createElement("div");
    newElement.innerHTML = `<div><ion-icon name="warning" class="text-[#621B16] font-bold text-base"></ion-icon>&nbsp;<ion-text class="text-[#621B16] font-bold text-base">${message}</ion-text></div>`;
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  }
}
