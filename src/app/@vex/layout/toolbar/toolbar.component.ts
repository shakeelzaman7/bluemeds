import { Component, ElementRef, HostBinding, Input, Output, OnInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import icMenu from '@iconify/icons-ic/twotone-menu';
import { ConfigService } from '../../services/config.service';
import { map } from 'rxjs/operators';
import { NavigationService } from '../../services/navigation.service';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import { PopoverService } from '../../components/popover/popover.service';
import { MegaMenuComponent } from '../../components/mega-menu/mega-menu.component';
import icSearch from '@iconify/icons-ic/twotone-search';
import { ConfigName } from '../../interfaces/config-name.model';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from 'src/app/core/api/api.service';
import { Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { AlertController } from '@ionic/angular';
import { capitalizeWords } from 'src/app/@vex/utils/capitalize';
@Component({
  selector: 'vex-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Input() mobileQuery: boolean;

  @Input()
  @HostBinding('class.shadow-b')
  hasShadow: boolean;

  get navigationItems() { return this.navigationService.items};
  get meInfo() { return this.authService.meInfo};

  isHorizontalLayout$ = this.configService.config$.pipe(map(config => config.layout === 'horizontal'));
  isVerticalLayout$ = this.configService.config$.pipe(map(config => config.layout === 'vertical'));
  isNavbarInToolbar$ = this.configService.config$.pipe(map(config => config.navbar.position === 'in-toolbar'));
  isNavbarBelowToolbar$ = this.configService.config$.pipe(map(config => config.navbar.position === 'below-toolbar'));

  icMenu = icMenu;
  isAuthenticated: boolean
  me: any;
  name: string;
  capitalizeWords = capitalizeWords;

  constructor(private layoutService: LayoutService,
              private configService: ConfigService,
              private authService: AuthService,
              private api: ApiService,
              private router: Router,
              private cd: ChangeDetectorRef,
              private navigationService: NavigationService,
              private popoverService: PopoverService,
              private eventService: EventService,
              private alertCtrl: AlertController
            ) { }

  ngOnInit() {
    this.start()
  }

  async start() {
    this.isAuthenticated = await this.authService.hasToken();

    this.cd.detectChanges();
    this.authService.authStatusChanged.subscribe((val: boolean) => {
      this.isAuthenticated = val
      this.cd.detectChanges();
    });
  }

  get envWarning() {
    switch(environment.deploymentEnvironment)
    {
      case 'QA':
        return "Estas en el ambiente de QA";
      case 'staging':
        return 'Estás en el ambiente de formación';
      default:
        return null;
    }
  }

  get isApollo()
  {
    return this.configService.current == ConfigName.apollo
  }

  openQuickpanel() {
    this.layoutService.openQuickpanel();
  }

  openSidenav() {
    this.layoutService.openSidenav();
  }

  openMegaMenu(origin: ElementRef | HTMLElement) {
    this.popoverService.open({
      content: MegaMenuComponent,
      origin,
      position: [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });
  }

  openSearch() {
    this.layoutService.openSearch();
  }

  redirectTo(route: string): void {
    this.router.navigate([route]);
  }

  async logout() {
    if(this.isAuthenticated)
    {
      const alert = await this.alertCtrl.create({
        header: "Confirmar",
        message: "¿Está seguro que desa salir del sistema?",
        buttons: [
          {
            text: "Cancelar",
            role: "cancel"
          },
          {
            text: "Salir",
            handler: () => {
              this.authService.logout();
            }
          }
        ],
      });
      alert.present();
    }
  }
}
