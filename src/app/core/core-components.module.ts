import { IonicModule } from '@ionic/angular';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VivoToolbarComponent } from './vivo-toolbar/vivo-toolbar.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ResourceTableComponent } from './components/resource-table/resource-table.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatSortModule } from '@angular/material/sort';
import { ValidatableFormComponent } from './components/validatable-form/validatable-form.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImagePreloadDirective } from './directives/image-preload/image-preload.directive';
import { LocalizedDatepickerComponent } from './components/localized-datepicker/localized-datepicker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { UpdatePaymentDialogComponent } from './components/update-payment-dialog/update-payment-dialog.component';
import { MultiSelectComponent } from  './components/multi-select/multi-select.component'


@NgModule({
  declarations: [
    VivoToolbarComponent,
    ConfirmationDialogComponent,
    UpdatePaymentDialogComponent,
    ResourceTableComponent,
    ValidatableFormComponent,
    ImagePreloadDirective,
    LocalizedDatepickerComponent,
    BreadcrumbsComponent,
    MultiSelectComponent
  ],
  exports: [
    VivoToolbarComponent,
    ConfirmationDialogComponent,
    UpdatePaymentDialogComponent,
    ResourceTableComponent,
    ValidatableFormComponent,
    ImagePreloadDirective,
    LocalizedDatepickerComponent,
    BreadcrumbsComponent,
    MultiSelectComponent
  ],
  entryComponents: [
    VivoToolbarComponent,
    ConfirmationDialogComponent,
    UpdatePaymentDialogComponent,
    ResourceTableComponent,
    ValidatableFormComponent,
    ImagePreloadDirective,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    IconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSortModule,
    MatMenuModule,
    ReactiveFormsModule,
    RouterModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CoreComponentModule { }
