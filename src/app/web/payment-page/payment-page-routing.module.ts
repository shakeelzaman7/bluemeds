import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentPagePage } from './payment-page.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentPagePageRoutingModule {}
