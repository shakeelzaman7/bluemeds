import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormResultsComponent } from './form-results.component';
import { FlexModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FormResultsComponent],
  imports: [
    CommonModule,
    CoreComponentModule,
    IonicModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    FlexModule  
  ],
  exports: [FormResultsComponent]
})
export class FormResultsModule { }
