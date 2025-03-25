import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillingComponent } from './billing.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import {PaymentMethodModule} from "../payment-method/payment-method.module";
import {PaymentMethodListModule} from "../payment-method-list/payment-method-list.module";

@NgModule({
  declarations: [BillingComponent],
    imports: [
        CommonModule,
        CoreComponentModule,
        IonicModule,
        MatInputModule,
        MatSelectModule,
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatExpansionModule,
        MatTooltipModule,
        MatIconModule,
        IconModule,
        PaymentMethodModule,
        PaymentMethodListModule
    ],
  exports: [BillingComponent]
})

export class BillingModule { }
