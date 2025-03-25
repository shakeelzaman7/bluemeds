import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from 'src/app/core/components/message-dialog/message-dialog.component';
import { map } from "rxjs/operators";
import { ChangeDataFormService } from './services/components/change-data-form-service';

@Injectable({
  providedIn: 'root'
})

export class NavigationGuard implements CanDeactivate<any> {
  constructor(private changeData: ChangeDataFormService, private dialog: MatDialog) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.changeData.getChangeData) {
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        disableClose: true,
        width: '450px',
        data: {
          title: '¿Desea guardar los cambios?',
          secondMessage: 'No has guardado los cambios, al salir de esta página se pierden todos los cambios realizados.',
          textButton: 'Cancelar',
          textButton2: 'Guardar',
          typeMessage: 'error',
          showButton2: true,
        }
      });

      return dialogRef.afterClosed().pipe(
        map(result => {
          !result ? this.changeData.resetChange() : this.changeData.saveChanges();

          return !result;
        }),
      );
    }

    return true;
  }
}
