import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { IonicModule } from '@ionic/angular';

import { AddPaymentMethodPageRoutingModule } from './add-payment-method-routing.module';

import { AddPaymentMethodPage } from './add-payment-method.page';

import { PaymentMethodModule } from '../components/payment-method/payment-method.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPaymentMethodPageRoutingModule,
    PaymentMethodModule,
    ContainerModule
  ],
  declarations: [AddPaymentMethodPage]
})
export class AddPaymentMethodPageModule {}
