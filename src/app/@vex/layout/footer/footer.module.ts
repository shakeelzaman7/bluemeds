import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { IconModule } from '@visurel/iconify-angular';
import { ContainerModule } from '../../directives/container/container.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    IconModule,
    ContainerModule,
    IonicModule
  ],
  declarations: [FooterComponent],
  exports: [FooterComponent]
})
export class FooterModule {
}
