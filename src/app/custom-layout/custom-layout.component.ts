import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { LayoutService } from '../@vex/services/layout.service';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { checkRouterChildsData } from '../@vex/utils/check-router-childs-data';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ConfigService } from '../@vex/services/config.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SidebarComponent } from '../@vex/components/sidebar/sidebar.component';
import { DeliveryItem } from '../models/delivery-item';


@UntilDestroy()
@Component({
  selector: 'vex-custom-layout',
  templateUrl: './custom-layout.component.html',
  styleUrls: ['./custom-layout.component.scss']
})
export class CustomLayoutComponent implements OnInit {



  sidenavCollapsed$ = this.layoutService.sidenavCollapsed$;
  isFooterVisible$ = this.configService.config$.pipe(map(config => config.footer.visible));
  isDesktop$ = this.layoutService.isDesktop$;

  toolbarShadowEnabled$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => checkRouterChildsData(this.router.routerState.root.snapshot, data => data.toolbarShadowEnabled))
  );

  @ViewChild('configpanel', { static: true }) configpanel: SidebarComponent;

  footerItems = [
    {
      iconName: "phone",
      text: "Llámanos",
      label: "PBX 2427 2000",
      href: "tel:2427 2000"
    },
    {
      iconName: "whatsapp",
      text: "Escríbenos",
      label: "2427-2000",
      href: "https://api.whatsapp.com/send?phone=50224272000"
    },
    {
      iconName: "map-pin",
      text: "Visítanos",
      label: "Clínicas Blue Medical",
      href: "https://mibluemedical.com/blue-medical-horarios-ubicaciones/"
    }
  ]

  constructor(public layoutService: LayoutService,
              private configService: ConfigService,
              private breakpointObserver: BreakpointObserver,
              private router: Router) { }


  ngOnInit() {
    /*this.layoutService.configpanelOpen$.pipe(
      untilDestroyed(this)
    ).subscribe(open => open ? this.configpanel.open() : this.configpanel.close());*/
  }
}
