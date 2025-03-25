import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubFailurePage } from './sub-failure.page';

const routes: Routes = [
  {
    path: '',
    component: SubFailurePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubFailureRoutingModule {}
