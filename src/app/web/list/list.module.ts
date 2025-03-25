import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { WebComponentsModule } from '../components/web-components.module';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CoreComponentModule } from 'src/app/core/core-components.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FormResultsModule} from "../components/form-results/form-results.module";
import { MatProgressBarModule } from '@angular/material/progress-bar';

export const MY_FORMATS = {

  parse: {
      dateInput: 'YYYY-MM-DD'
  },
  display: {
      dateInput: 'DD/MM/YYYY'
  }
};

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatInputModule,
        ListPageRoutingModule,
        ReactiveFormsModule,
        ContainerModule,
        MatIconModule,
        IconModule,
        MatIconModule,
        WebComponentsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        CoreComponentModule,
        FlexLayoutModule,
        MatExpansionModule,
        MatRadioModule,
        MatTooltipModule,
        FormResultsModule,
        MatProgressBarModule
    ],
  declarations: [ListPage],
})
export class ListPageModule {}
