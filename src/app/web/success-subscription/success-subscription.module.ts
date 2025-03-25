import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { SuccessSubscriptionRoutingModule } from './success-subscription-routing.module';
import { SuccessSubscriptionPage } from './success-subscription.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SuccessSubscriptionRoutingModule
  ],
  declarations: [SuccessSubscriptionPage]
})

export class SuccessSubscriptionPageModule {}
