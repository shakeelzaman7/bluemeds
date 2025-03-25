import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
})
export class BillingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  directionList = [
    {text: 'Inicio', route: '/web/welcome'},
    {text: 'Datos de facturación', route: '/web/billing-data'},
  ];

}
