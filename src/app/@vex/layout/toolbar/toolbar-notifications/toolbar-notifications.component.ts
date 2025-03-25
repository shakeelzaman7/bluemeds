import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PopoverService } from '../../../components/popover/popover.service';
import { ToolbarNotificationsDropdownComponent } from './toolbar-notifications-dropdown/toolbar-notifications-dropdown.component';
import icNotificationsActive from '@iconify/icons-ic/list';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LayoutService } from 'src/app/@vex/services/layout.service';

@Component({
  selector: 'vex-toolbar-notifications',
  templateUrl: './toolbar-notifications.component.html',
  styleUrls: ['./toolbar-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarNotificationsComponent implements OnInit {

  @ViewChild('originRef', { static: true, read: ElementRef }) originRef: ElementRef;

  dropdownOpen: boolean;
  icNotificationsActive = icNotificationsActive;
  isAuthenticated:boolean = false;
  constructor(private popover: PopoverService,
    private cd: ChangeDetectorRef,
    private authService: AuthService, public layoutService: LayoutService) { }

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

  showPopover() {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarNotificationsDropdownComponent,
      origin: this.originRef,
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
