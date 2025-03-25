import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryAddressPageRoutingModule } from './delivery-address-routing.module';

import { DeliveryAddressPage } from './delivery-address.page';
import { DeliveryAddressModule } from '../components/delivery-address/delivery-address.module';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { ContainerModule } from 'src/app/@vex/directives/container/container.module';

import {CoreComponentModule} from "../../core/core-components.module";

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { MatSelectModule } from '@angular/material/select';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import { WebComponentsModule } from '../components/web-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryAddressPageRoutingModule,
    ContainerModule,
    WebComponentsModule,
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
    DeliveryAddressModule
  ],
  declarations: [DeliveryAddressPage]
})
export class DeliveryAddressPageModule {}
