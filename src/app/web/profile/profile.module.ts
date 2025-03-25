import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProfilePage } from './profile.page';

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
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import { WebComponentsModule } from '../components/web-components.module';
import {PersonalInformationModule} from "../components/personal-information/personal-information.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
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
    PersonalInformationModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
