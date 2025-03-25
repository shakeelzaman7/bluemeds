import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {SearchPageRoutingModule} from './search-routing.module';
import {SearchPage} from './search.page';
import {CoreComponentModule} from 'src/app/core/core-components.module';
import {PageLayoutModule} from 'src/app/@vex/components/page-layout/page-layout.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BreadcrumbsModule} from 'src/app/@vex/components/breadcrumbs/breadcrumbs.module';
import {ContainerModule} from 'src/app/@vex/directives/container/container.module';
import {IconModule} from '@visurel/iconify-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import {WebComponentsModule} from '../components/web-components.module';
import { FormResultsModule } from '../components/form-results/form-results.module';
import { HttpClientModule } from '@angular/common/http';
import { ElasticsearchService } from '../../../app/services/elasticsearch.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule,
    CoreComponentModule,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
    ContainerModule,
    IconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    WebComponentsModule,
    FormResultsModule,
    HttpClientModule
  ],
  declarations: [SearchPage],
  providers: [ElasticsearchService]
})
export class SearchPageModule {
}