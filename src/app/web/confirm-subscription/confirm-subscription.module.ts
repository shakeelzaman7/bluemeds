import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerModule } from 'src/app/@vex/directives/container/container.module';
import { IonicModule } from '@ionic/angular';

import { ConfirmSubscriptionPageRoutingModule } from './confirm-subscription-routing.module';
import { ConfirmSubscriptionPage } from './confirm-subscription.page';
import {PersonalInformationModule} from "../components/personal-information/personal-information.module";
import {FlexModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaymentMethodModule} from "../components/payment-method/payment-method.module";
import {WebComponentsModule} from "../components/web-components.module";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ConfirmSubscriptionPageRoutingModule,
    ContainerModule,
    PersonalInformationModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentMethodModule,
    WebComponentsModule
  ],
  declarations: [ConfirmSubscriptionPage]
})

export class ConfirmSubscriptionPageModule {}
