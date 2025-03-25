import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@angular/flex-layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeliveryAddressComponent } from "./delivery-address.component";
import { MatIconModule } from '@angular/material/icon';
import { NgxMatIntlTelInputModule } from "ngx-mat-intl-tel-input";

@NgModule({
  declarations: [DeliveryAddressComponent],
  imports: [
    CommonModule,
    CoreComponentModule,
    IonicModule,
    MatInputModule,
    MatSelectModule,
    FlexModule,
    FormsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxMatIntlTelInputModule
  ],
  exports: [DeliveryAddressComponent]
})

export class DeliveryAddressModule { }
