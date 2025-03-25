import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PaymentMethodListComponent } from './payment-method-list.component';
import { PaymentMethodCardModule } from '../payment-method-card/payment-method-card.module';

@NgModule({
  declarations: [PaymentMethodListComponent],
  imports: [
    CommonModule,
    CoreComponentModule,
    IonicModule,
    MatInputModule,
    MatSelectModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    PaymentMethodCardModule
  ],
  exports: [PaymentMethodListComponent]
})

export class PaymentMethodListModule { }
