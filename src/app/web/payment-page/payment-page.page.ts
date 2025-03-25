import {Component, OnInit, ViewChild} from '@angular/core';
import { ChangeDataFormService } from '../services/components/change-data-form-service';
import { PaymentMethodComponent } from '../components/payment-method/payment-method.component';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.page.html',
  styleUrls: ['./payment-page.page.scss'],
})
export class PaymentPagePage implements OnInit {
  @ViewChild(PaymentMethodComponent) paymentMethodComponent: PaymentMethodComponent;

  public openPaymentMethod = false;
  public paymentMethodsCount = 0;

  public directionList = [
    {text: 'Inicio', route: '/web/welcome'},
    {text: 'Método de pago', route: '/web/payment-page'},
  ];

  constructor(private changeDataFormService: ChangeDataFormService) {
  }

  ngOnInit() {
  }

  setPaymentMethodsCount(paymentMethodsLength: number) {
    this.paymentMethodsCount = paymentMethodsLength;
  }

  reloadPaymentMethods(isPaymentSaved: boolean) {
    this.paymentMethodsCount = isPaymentSaved ? this.paymentMethodsCount + 1 : this.paymentMethodsCount;
    this.openPaymentMethod = false;

    this.changeDataFormService.resetChange();
  }

  tooglePaymentMethod() {
    this.openPaymentMethod = !this.openPaymentMethod;

    if (!this.openPaymentMethod) {
      this.changeDataFormService.resetChange();
    } else {
      this.paymentMethodComponent.verifyHasChanges();
    }
  }
}
