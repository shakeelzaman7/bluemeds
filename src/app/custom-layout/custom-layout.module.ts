import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLayoutComponent } from './custom-layout.component';
import { SidenavModule } from '../@vex/layout/sidenav/sidenav.module';
import { ToolbarModule } from '../@vex/layout/toolbar/toolbar.module';
import { FooterModule } from '../@vex/layout/footer/footer.module';
import { ConfigPanelModule } from '../@vex/components/config-panel/config-panel.module';
import { SidebarModule } from '../@vex/components/sidebar/sidebar.module';
import { QuickpanelModule } from '../@vex/layout/quickpanel/quickpanel.module';
import { LayoutModule } from '../@vex/layout/layout.module';
import { ContainerModule } from '../@vex/directives/container/container.module';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [CustomLayoutComponent],
  imports: [
    CommonModule,
    LayoutModule,
    SidenavModule,
    IonicModule,
    ToolbarModule,
    FooterModule,
    ContainerModule,
    ConfigPanelModule,
    SidebarModule,
    QuickpanelModule
  ]
})
export class CustomLayoutModule {
}
