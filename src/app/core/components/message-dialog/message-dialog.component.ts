import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import icClose from '@iconify/icons-ic/twotone-close';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})

export class MessageDialogComponent implements OnInit {
  icClose = icClose;
  message: string;
  secondMessage: string;
  title: string;
  textButton: string;
  textButton2: string;
  typeMessage: string;
  showButton2: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<MessageDialogComponent>) {
    this.message = data.message ?? "";
    this.title = data.title ?? "Mensaje";
    this.textButton = data.textButton ?? "Cerrar";
    this.textButton2 = data.textButton2 ?? "Aceptar";
    this.secondMessage = data.secondMessage ?? "";
    this.typeMessage = data.typeMessage ?? "success";
    this.showButton2 = data.showButton2 ?? false;
  }
  ngOnInit() {
  }

  close(answer: boolean) {
    this.dialogRef.close(answer);
  }
}

@NgModule({
  declarations: [MessageDialogComponent],
  imports: [
    CommonModule
  ]
})
export class MessageDialogModule {}
