import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/@vex/services/layout.service';

@Component({
  selector: 'app-first-steps',
  templateUrl: './first-steps.page.html',
  styleUrls: ['./first-steps.page.scss'],
})

export class FirstStepsPage implements OnInit {
  showCongratulationsText: boolean = false;
  welcomeMenu = [{
    step: '1',
    label: 'Si no has agregado medicamentos, encuéntralos aquí',
    icon: 'add-circle-outline',
    buttonLabel: 'Buscar medicamentos',
    route : '/web/search'
  },
  {
    step: '2',
    label: 'Agrega fechas de entrega',
    icon: 'calendar-outline',
    buttonLabel: 'Configurar fechas',
    route : '/web/list'
  },
  {
    step: '3',
    label: 'Completa tus datos personales y verifica tu cuenta',
    icon: 'person-outline',
    buttonLabel: 'Registrar datos',
    route : '/web/list'
  }];

  constructor(
    private router: Router,
    public layoutService: LayoutService
  ) { }

  ngOnInit() {
  }

  navigateToRoute(route: string): void{
    if(!route.includes('search')){
      this.showCongratulationsText=false;
    }
    this.router.navigate([route]);
  }
}
