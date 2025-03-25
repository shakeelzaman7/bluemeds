import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { PaymentMethod } from 'src/app/models/payment-method';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ConfirmationDialogComponent } from "../../../core/components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { UpdatePaymentDialogComponent } from 'src/app/core/components/update-payment-dialog/update-payment-dialog.component';



@Component({
  selector: 'app-component-payment-method-card',
  templateUrl: './payment-method-card.component.html',
  styleUrls: ['./payment-method-card.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})
export class PaymentMethodCardComponent implements OnInit {
  @Input() showSaveButton = false;
  @Input() showExpansionPanels = false;

  @Input() paymentMethod: PaymentMethod;
  @Input() selectedPaymentMethod: PaymentMethod;

  @Input() deliveryId: string = null;
  @Input() canDelete = false;

  @Output() changedPaymentMethod = new EventEmitter<PaymentMethod>();
  @Output() paymentMethodUpdated = new EventEmitter<any>();
  @Output() paymentMethodDeleted = new EventEmitter<PaymentMethod>();

  public isChecked = false;

  constructor(
    private api: ApiService,
    public layoutService: LayoutService,
    private matDialog: MatDialog,
  ) {
  }

  async ngOnInit() {
    await this.start();
  }

  async start() {
    this.isChecked = this.shouldBeChecked();
  }

  /**
   * Selects a payment method.
   *
   * @param paymentMethod - The payment method to select.
   */
  public selectPaymentMethod(paymentMethod: PaymentMethod) {
    this.selectedPaymentMethod = paymentMethod;
    this.isChecked = this.shouldBeChecked();
    this.changedPaymentMethod.emit(paymentMethod);
  }

  /**
   * Deletes a payment method.
   *
   * @param paymentMethod - The payment method to delete.
   * @returns - A promise that resolves when the payment method is deleted.
   */
  public async deletePaymentMethod(paymentMethod: PaymentMethod) {
    this.matDialog.open(ConfirmationDialogComponent, {
      width: '500px',
      panelClass: 'custom-padding-class-dialog',
      data: {
        message: 'Eliminar método de pago.',
        question: '¿Estás seguro que deseas eliminar esta tarjeta?',
        buttonText_1: 'No',
        buttonText_2: 'Si',
        showTitle: false,
      }
    }).afterClosed().subscribe(async (result) => {
      if (result) {
        await this.api.delete('profile/payments/' + this.deliveryId + '/' + paymentMethod.id, {
          body: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            delivery_id: this.deliveryId,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_id: paymentMethod.id
          }
        }).toPromise<any>();
        this.paymentMethodDeleted.emit(paymentMethod);
      }
    });
  }

  public shouldBeChecked(): boolean {
    return this.selectedPaymentMethod?.id === this.paymentMethod?.id;
  }

  public updatePaymentMethod(paymentMethod: any) {
    this.matDialog.open(UpdatePaymentDialogComponent, {
      width: '600px',
      data: {
        paymentMethod: paymentMethod
      }
    }).afterClosed().subscribe(async (paymentMethod) => {
      if (!paymentMethod) {
        return;
      }

      this.paymentMethodUpdated.emit(paymentMethod);
    });
  }
}
