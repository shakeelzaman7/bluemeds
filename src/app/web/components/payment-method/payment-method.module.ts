import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethodComponent } from "./payment-method.component";
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [PaymentMethodComponent],
  imports: [
    CommonModule,
    CoreComponentModule,
    IonicModule,
    MatInputModule,
    MatSelectModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  exports: [PaymentMethodComponent]
})

export class PaymentMethodModule { }
