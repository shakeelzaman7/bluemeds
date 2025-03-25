import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReferralProgramTermsPageRoutingModule } from './referral-program-terms-routing.module';
import { ReferralProgramTermsPage } from './referral-program-terms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReferralProgramTermsPageRoutingModule
  ],
  declarations: [ReferralProgramTermsPage]
})

export class ReferralProgramTermsPageModule {}
