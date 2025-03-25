import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../@vex/services/navigation.service';
import { webMenu } from './navigation/menu';
@Component({
  selector: 'app-web',
  templateUrl: './web.page.html',
  styleUrls: ['./web.page.scss'],
})
export class WebPage implements OnInit {

  public constructor(navigationService: NavigationService)
  {
    navigationService.items = webMenu;
  }

  ngOnInit(): void {
    
  }
}
