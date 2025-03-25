import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WizardRegisterPageRoutingModule } from './wizard-register-routing.module';

import { WizardRegisterPage } from './wizard-register.page';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { MatSelectModule } from '@angular/material/select';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {CoreComponentModule} from "../../core/core-components.module";
import {NgxMatIntlTelInputModule} from "ngx-mat-intl-tel-input";
import {PersonalInformationModule} from "../components/personal-information/personal-information.module";
import {DeliveryAddressModule} from "../components/delivery-address/delivery-address.module";
import { BillingModule } from '../components/billing/billing.module';
import { PaymentMethodModule } from '../components/payment-method/payment-method.module';
import { PaymentMethodListModule } from '../components/payment-method-list/payment-method-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WizardRegisterPageRoutingModule,
    ContainerModule,
    FlexLayoutModule,
    MatInputModule,
    MatIconModule,
    IconModule,
    MatSelectModule,
    GooglePlaceModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDialogModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    CoreComponentModule,
    NgxMatIntlTelInputModule,
    ReactiveFormsModule,
    PersonalInformationModule,
    DeliveryAddressModule,
    BillingModule,
    PaymentMethodModule,
    PaymentMethodListModule
  ],
  declarations: [WizardRegisterPage]
})
export class WizardRegisterPageModule {}
