import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReferralProgramTermsPage } from './referral-program-terms.page';

const routes: Routes = [
  {
    path: '',
    component: ReferralProgramTermsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ReferralProgramTermsPageRoutingModule {}
