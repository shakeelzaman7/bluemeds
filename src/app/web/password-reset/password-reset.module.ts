import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordResetPageRoutingModule } from './password-reset-routing.module';

import { PasswordResetPage } from './password-reset.page';
import { CoreModule, FlexLayoutModule } from '@angular/flex-layout';
import { LoginPageRoutingModule } from '../login/login-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IconModule } from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VexModule } from 'src/app/@vex/vex.module';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { WebComponentsModule } from '../components/web-components.module';

@NgModule({
  imports: [
    WebComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordResetPageRoutingModule,
    FlexLayoutModule,
    LoginPageRoutingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    IconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    VexModule,
    CoreModule,
    CoreComponentModule
  ],
  declarations: [PasswordResetPage]
})
export class PasswordResetPageModule {}
