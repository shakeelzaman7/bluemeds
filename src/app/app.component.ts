import { Component, OnInit } from '@angular/core';
import { ApplicationsService } from './services/applications/applications.service';
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(private appServices: ApplicationsService) {
  }
  
  ngOnInit(): void {
    //this.appServices.refresh()
  }
}
