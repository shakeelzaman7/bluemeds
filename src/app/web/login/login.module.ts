import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginPage } from './login.page';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VexModule } from 'src/app/@vex/vex.module';
import { CoreModule, FlexLayoutModule } from '@angular/flex-layout';
import { LoginGuard } from '../login-guard';
import {ContainerModule} from "../../@vex/directives/container/container.module";
import {CoreComponentModule} from "../../core/core-components.module";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        IonicModule,
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
        ContainerModule,
        CoreComponentModule
    ],
  declarations: [LoginPage],
  providers: [LoginGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPageModule {}
