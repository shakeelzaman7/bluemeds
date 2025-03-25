import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

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
import { BillingPageRoutingModule } from './billing-routing.module';
import { BillingModule } from '../components/billing/billing.module';
import { BillingPage } from './billing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BillingPageRoutingModule,
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
    BillingModule
  ],
  declarations: [BillingPage]
})
export class BillingPageModule {}
