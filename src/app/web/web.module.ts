import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { IonicModule } from '@ionic/angular';

import { WebPageRoutingModule } from './web-routing.module';

import { WebPage } from './web.page';
import { WebGuard } from './web-guard';
import { NavigationGuard } from './navigation-guard';
import { ListService } from './services/list/list.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WebPageRoutingModule,
    MatDialogModule
  ],
  declarations: [WebPage],
  providers: [WebGuard, ListService, NavigationGuard]
})
export class WebPageModule {}
