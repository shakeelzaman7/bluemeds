import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@angular/flex-layout';
import { PersonalInformationComponent } from './personal-information.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {NgxMatIntlTelInputModule} from "ngx-mat-intl-tel-input";
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [PersonalInformationComponent],
  imports: [
    CommonModule,
    CoreComponentModule,
    IonicModule,
    MatInputModule,
    MatSelectModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    NgxMatIntlTelInputModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule
  ],
  exports: [PersonalInformationComponent]
})

export class PersonalInformationModule { }
