import {Component, OnInit} from '@angular/core';
import moment from 'moment';
import {ListService} from '../services/list/list.service';
import {AuthService} from 'src/app/core/auth/auth.service';
import {LayoutService} from "../../@vex/services/layout.service";
import { Customer_Classifier } from 'src/app/models/customer_classifier';

let settings:any = null

@Component({
  selector: 'app-sub-success',
  templateUrl: './sub-success.page.html',
  styleUrls: ['./sub-success.page.scss'],
})
export class SubSuccessPage implements OnInit {

  list: any;
  items: any[] = [];
  authInfo: any;
  customerClassifier = Customer_Classifier;

  constructor(
    private listService: ListService,
    private authService: AuthService,
    public layoutService: LayoutService
  ) {}
  ngOnInit() {
    this.start();
  }

  async start() {
    this.list = await this.listService.getlist();

    /* Obtenemos los medicamentos que están dentro de cada batch denro de list.batches vienen dos arreglos, un arreglo de batches asegurados y otro
          de batches no asegurados, los recorremos para guardar los meds */
    let typeBatch = [];
    if (this.list.batches.with_insurance.length > 0) {
      typeBatch = typeBatch.concat(this.list.batches.with_insurance);
    }

    if (this.list.batches.without_insurance.length > 0) {
      typeBatch = typeBatch.concat(this.list.batches.without_insurance);
    }

    if (typeBatch.length > 0) {
      typeBatch.forEach(batch => {
        batch.items.forEach((med: any) => {
          if (this.list.delivery_method === 'by_date') {
            med.delivery_date_text = med.delivery_day + ' de cada ' + this.translateEach(med.each) + (med.duration == "undefined" ? '' : ' por ' + med.duration/2 + ( med.duration <= 2 ? ' mes' : ' meses'));
          } else {
            // formateamos la fecha de entrega al formato  d/m/Y
            med.delivery_date_text = moment(med.delivery_date).format('DD/MM/YYYY');
          }
          this.items.push(med);
        });
      });
    }

    this.list.delivery_date_input = moment(this.list.delivery_date).locale("es").format('LL');
    this.authInfo =  this.authService;
  }

  translateEach(each: number): string|null
  {
      switch (each) {
          case 1:
              return 'quincena';
          case 2:
              return 'mes';
          case 4:
              return '2 meses';
          case 6:
              return '3 meses';
          case 8:
              return '4 meses';
          case 10:
              return '5 meses';
          case 12:
              return '6 meses';
          default:
              return 'indefinido';
      }
  }

  printScreen() {
    window.print()
  }

  calculateDateDelivery() {
    // Mostraremos lo siguiente ej: 12 de enero de 2023. La fecha viene en list.delivery_date, viene en formato YYYY-MM-DD, obtenemos los datos y los mostramos en el formato que queremos
    let deliveryDate = this.list.delivery_date;
    let [deliveryYear, deliveryMonth, deliveryDay] = deliveryDate.split("-");

    // creamos la fecha como texto ej: 12 de enero de 2023.
    return `${deliveryDay} de ${this.getMonthName(parseInt(deliveryMonth))} de ${deliveryYear}`;
  }



  getMonthName(month: number) {
    let monthName = '';
    switch (month - 1) {
      case 0:
        monthName = 'Enero';
        break;
      case 1:
        monthName = 'Febrero';
        break;
      case 2:
        monthName = 'Marzo';
        break;
      case 3:
        monthName = 'Abril';
        break;
      case 4:
        monthName = 'Mayo';
        break;
      case 5:
        monthName = 'Junio';
        break;
      case 6:
        monthName = 'Julio';
        break;
      case 7:
        monthName = 'Agosto';
        break;
      case 8:
        monthName = 'Septiembre';
        break;
      case 9:
        monthName = 'Octubre';
        break;
      case 10:
        monthName = 'Noviembre';
        break;
      case 11:
        monthName = 'Diciembre';
        break;
    }
    return monthName;
  }

}
