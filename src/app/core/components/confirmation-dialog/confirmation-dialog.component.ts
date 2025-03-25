import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import icClose from '@iconify/icons-ic/twotone-close';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  icClose = icClose;
  invStyle = false;
  showTitle:boolean = true
  message:string
  question:string
  buttonText_1:string = "NO"
  buttonText_2:string = "SI"
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    this.message = data.message ?? "Confirmar acción"
    this.question = data.question ?? null
    this.buttonText_1 = data.buttonText_1 ?? "NO"
    this.buttonText_2 = data.buttonText_2 ?? "SI"
    this.showTitle = data.showTitle ?? true
    this.invStyle = data.invertStyle ?? false
  }

  ngOnInit() {
  }

  close(answer: boolean) {
    this.dialogRef.close(answer);
  }
}
