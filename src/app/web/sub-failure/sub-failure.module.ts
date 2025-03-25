import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubFailureRoutingModule } from './sub-failure-routing.module';

import { SubFailurePage } from './sub-failure.page';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatInputModule,
    SubFailureRoutingModule,       
  ],
  declarations: [SubFailurePage],
})
export class SubFailurePageModule {}
