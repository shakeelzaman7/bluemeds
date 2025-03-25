import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PublicationModalComponent } from './publication-modal/publication-modal.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule} from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UploadFileComponent} from "./upload-file/upload-file.component";
import { UploadProfileComponent } from './upload-profile/upload-profile.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { PasswordInputComponent } from './password-input/password-input.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AccountVerificationComponent } from './account-verification/account-verification.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    FlexLayoutModule,
    CoreComponentModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatIconModule,
    IconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    PublicationModalComponent,
    UploadFileComponent,
    AccountVerificationComponent,
    UploadProfileComponent,
    PasswordInputComponent,
    TermsConditionsComponent
  ],
  exports: [
    PublicationModalComponent,
    PasswordInputComponent,
    UploadFileComponent,
    AccountVerificationComponent,
    UploadProfileComponent,
    TermsConditionsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WebComponentsModule {}
