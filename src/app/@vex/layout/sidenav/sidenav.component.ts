import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { trackByRoute } from '../../utils/track-by';
import { NavigationService } from '../../services/navigation.service';
import icRadioButtonChecked from '@iconify/icons-ic/twotone-radio-button-checked';
import icRadioButtonUnchecked from '@iconify/icons-ic/twotone-radio-button-unchecked';
import { LayoutService } from '../../services/layout.service';
import { ConfigService } from '../../services/config.service';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'vex-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  @Input() collapsed: boolean;
  collapsedOpen$ = this.layoutService.sidenavCollapsedOpen$;
  title$ = this.configService.config$.pipe(map(config => config.sidenav.title));
  imageUrl$ = this.configService.config$.pipe(map(config => config.sidenav.imageUrl));
  showCollapsePin$ = this.configService.config$.pipe(map(config => config.sidenav.showCollapsePin));
  isDesktop$ = this.layoutService.isDesktop$;

  isAuthenticated: boolean
  get items() { return this.navigationService.items };
  private trackByRoute = trackByRoute;
  icRadioButtonChecked = icRadioButtonChecked;
  icRadioButtonUnchecked = icRadioButtonUnchecked;

  public get trackByRouteCasted() : any {
    return trackByRoute;
  }

  constructor(private navigationService: NavigationService,
              private layoutService: LayoutService,
              private authService: AuthService,
              private cd: ChangeDetectorRef,
              private configService: ConfigService,
              private router: Router) { }

  ngOnInit() {
    this.start();

    this.router.events.subscribe(event => {
      // close sidenav on routing
      this.layoutService.closeSidenav();
    });
  }

  async start() {
    this.isAuthenticated = await this.authService.hasToken();

    this.cd.detectChanges();
    this.authService.authStatusChanged.subscribe((val: boolean) => {
      this.isAuthenticated = val
      this.cd.detectChanges();
    });
  }

  onMouseEnter() {
    this.layoutService.collapseOpenSidenav();
  }

  onMouseLeave() {
    this.layoutService.collapseCloseSidenav();
  }

  toggleCollapse() {
    this.collapsed ? this.layoutService.expandSidenav() : this.layoutService.collapseSidenav();
  }
}
