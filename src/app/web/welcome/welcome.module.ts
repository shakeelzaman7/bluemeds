import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WelcomePageRoutingModule } from './welcome-routing.module';

import { WelcomePage } from './welcome.page';

import { BreadcrumbsComponent } from 'src/app/core/components/breadcrumbs/breadcrumbs.component';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    FormsModule,
    IonicModule,
    WelcomePageRoutingModule,
    CoreComponentModule,
    ContainerModule,
    ReactiveFormsModule
  ],
  declarations: [WelcomePage]
})
export class WelcomePageModule {}
