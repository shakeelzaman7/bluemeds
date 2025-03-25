import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.page.html',
  styleUrls: ['./delivery-address.page.scss'],
})
export class DeliveryAddressPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  directionList = [
    {text: 'Inicio', route: '/web/welcome'},
    {text: 'Dirección de entrega', route: '/web/delivery-address'},
  ];

}
