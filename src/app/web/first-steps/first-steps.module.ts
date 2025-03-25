import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { IonicModule } from '@ionic/angular';

import { FirstStepsPageRoutingModule } from './first-steps-routing.module';
import { FirstStepsPage } from './first-steps.page';

@NgModule({
  imports: [
    CommonModule,
    ContainerModule,
    IonicModule,
    FirstStepsPageRoutingModule
  ],
  declarations: [FirstStepsPage]
})

export class FirstStepsModule { }
