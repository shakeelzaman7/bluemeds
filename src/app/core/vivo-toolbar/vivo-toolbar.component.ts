import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-vivo-toolbar',
  templateUrl: './vivo-toolbar.component.html',
  styleUrls: ['./vivo-toolbar.component.scss'],
})
export class VivoToolbarComponent implements OnInit {
  @Input() pageTitle:String = "vivolife"
  constructor() { }

  ngOnInit() {
  }
}
