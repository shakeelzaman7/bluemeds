import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { VexModule } from 'src/app/@vex/vex.module';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import {WebComponentsModule} from '../components/web-components.module';
import {CoreComponentModule} from "../../core/core-components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    VexModule,
    ContainerModule,
    FlexLayoutModule,
    IconModule,
    WebComponentsModule,
    CoreComponentModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
