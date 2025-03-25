import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuccessSubscriptionPage } from './success-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: SuccessSubscriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class SuccessSubscriptionRoutingModule {}
