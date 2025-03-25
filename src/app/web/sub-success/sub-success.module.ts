import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubSuccessRoutingModule } from './sub-success-routing.module';

import { SubSuccessPage } from './sub-success.page';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatInputModule,
    SubSuccessRoutingModule,
  ],
  declarations: [SubSuccessPage],
})
export class SubSuccessPageModule {}
