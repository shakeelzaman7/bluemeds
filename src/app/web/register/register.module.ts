import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IconModule } from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VexModule } from 'src/app/@vex/vex.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { LoginGuard } from '../login-guard';
import { WebComponentsModule } from '../components/web-components.module';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    WebComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    IconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    VexModule,
    FlexLayoutModule,
    ContainerModule,
    CoreComponentModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  declarations: [RegisterPage],
  providers: [LoginGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class RegisterPageModule {}
