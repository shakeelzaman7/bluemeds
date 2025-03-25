import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginCallbackPageRoutingModule } from './login-callback-routing.module';
import { LoginCallbackPage } from './login-callback.page';
import { LoginGuard } from '../login-guard';

@NgModule({
  imports: [
    CommonModule,
    LoginCallbackPageRoutingModule
  ],
  declarations: [LoginCallbackPage],
  providers: [LoginGuard]
})

export class LoginCallbackPageModule {}
