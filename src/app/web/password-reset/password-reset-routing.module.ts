import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordResetPage } from './password-reset.page';

const routes: Routes = [
  {
    path: ':token',
    component: PasswordResetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordResetPageRoutingModule {}
