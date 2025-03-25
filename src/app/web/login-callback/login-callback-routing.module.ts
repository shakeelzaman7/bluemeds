import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from '../login-guard';
import { LoginCallbackPage } from './login-callback.page';

const routes: Routes = [
  {
    path: '',
    component: LoginCallbackPage,
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class LoginCallbackPageRoutingModule {}
