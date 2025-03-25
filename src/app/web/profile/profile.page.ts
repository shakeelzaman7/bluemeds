import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor() { }

  directionList = [
    {text: 'Inicio', route: '/web/welcome'},
    {text: 'Información personal', route: '/web/profile'},
  ];

  ngOnInit() {
   
  }

}

