import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PopoverService } from '../../../components/popover/popover.service';
import { ToolbarUserDropdownComponent } from './toolbar-user-dropdown/toolbar-user-dropdown.component';
import icPerson from '@iconify/icons-ic/twotone-person';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LayoutService } from 'src/app/@vex/services/layout.service';

@Component({
  selector: 'vex-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  styleUrls: ['./toolbar-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserComponent implements OnInit {

  dropdownOpen: boolean;
  icPerson = icPerson;
  isAuthenticated: boolean
  isDesktop$ = this.layoutService.isDesktop$;

  constructor(private popover: PopoverService,
    private cd: ChangeDetectorRef,
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController) { }


  ngOnInit() {
    this.start()
  }

  async start() {
    this.isAuthenticated = await this.authService.isAuthenticated();
    this.cd.detectChanges();
    this.authService.authStatusChanged.subscribe((val: boolean) => {
      this.isAuthenticated = val
      this.cd.detectChanges();
    });
  }

  async login() {
    window.location.href = '/web/login';
  }

  showPopover(originRef: HTMLElement) {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarUserDropdownComponent,
      origin: originRef,
      offsetY: 12,
      position: [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });

    popoverRef.afterClosed$.subscribe(() => {
      this.dropdownOpen = false;
      this.cd.markForCheck();
    });
  }
}
