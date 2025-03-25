import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ChangeDataFormService {
  private changeData: boolean = false;
  private saveChangesSubject = new Subject<void>();

  constructor() { }

  get getChangeData() {
    return this.changeData;
  }

  markChangePending() {
    this.changeData = true;
  }

  resetChange() {
    this.changeData = false;
  }

  // función para emitir un evento cuando se quieren guardan los cambios
  saveChanges() {
    this.saveChangesSubject.next();
  }

  // función para suscribirse al evento de guardar cambios
  getSaveChanges() {
    return this.saveChangesSubject.asObservable();
  }
}
