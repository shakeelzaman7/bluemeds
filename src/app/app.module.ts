import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, Router } from '@angular/router';
 
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { VexModule } from './@vex/vex.module';
import { CustomLayoutModule } from './custom-layout/custom-layout.module';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AuthInterceptor } from './core/auth/auth-interceptor.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorI18nService } from './core/intl_service/mat-paginator-i18n.service';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import * as Sentry from "@sentry/angular";
import { WebComponentsModule } from './web/components/web-components.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    VexModule,
    CustomLayoutModule,
    WebComponentsModule,
     HttpClientModule, 
    MatSnackBarModule, 
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] }})  
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    (environment.currentDataHandler as any),
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginatorI18nService,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    }, {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
  constructor(trace: Sentry.TraceService) {}
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}