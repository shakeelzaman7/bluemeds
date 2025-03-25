import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BudgetPageRoutingModule } from './budget-routing.module';
import { BudgetPage } from './budget.page';
import {MatIconModule} from '@angular/material/icon'
import {ContainerModule} from "../../@vex/directives/container/container.module";
import {CoreComponentModule} from "../../core/core-components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BudgetPageRoutingModule,
        MatIconModule,
        ContainerModule,
        CoreComponentModule
    ],
  declarations: [BudgetPage]
})
export class BudgetPageModule {}
