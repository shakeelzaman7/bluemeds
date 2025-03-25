import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubSuccessPage } from './sub-success.page';

const routes: Routes = [
  {
    path: '',
    component: SubSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubSuccessRoutingModule {}
