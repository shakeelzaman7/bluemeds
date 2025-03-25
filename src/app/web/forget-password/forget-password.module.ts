import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgetPasswordPageRoutingModule } from './forget-password-routing.module';

import { ForgetPasswordPage } from './forget-password.page';
import { LoginPageRoutingModule } from '../login/login-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IconModule } from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VexModule } from 'src/app/@vex/vex.module';
import { CoreModule, FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgetPasswordPageRoutingModule,
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
    CoreModule
  ],
  declarations: [ForgetPasswordPage]
})
export class ForgetPasswordPageModule {}
