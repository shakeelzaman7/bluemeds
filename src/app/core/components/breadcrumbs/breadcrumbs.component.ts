import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

export class BreadcrumbsComponent implements OnInit, AfterViewInit {
  @Input() directionList: { text: string, route: string }[];

  ngOnInit() {

  }

  ngAfterViewInit() {

  }
}
