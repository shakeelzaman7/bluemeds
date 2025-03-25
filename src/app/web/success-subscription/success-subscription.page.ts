import {Component, OnInit} from '@angular/core';
import moment from 'moment';
import { ListService } from '../services/list/list.service';
import { LayoutService } from "../../@vex/services/layout.service";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../core/api/api.service";
import { Customer_Classifier } from 'src/app/models/customer_classifier';

@Component({
  selector: 'app-success-subscription',
  templateUrl: './success-subscription.page.html',
  styleUrls: ['./success-subscription.page.scss'],
})

export class SuccessSubscriptionPage implements OnInit {
  public token: string;
  public deliveryID: number;
  public typeForm: string;

  list: any;
  profile: any;
  items: any[] = [];
  customerClassifier = Customer_Classifier;

  constructor(private listService: ListService, public layoutService: LayoutService, private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params.token;
      this.deliveryID = params.delivery_id;
      this.typeForm = params.type_form;
    });

    this.start();
  }

  async start() {
    // obtenemos la información de la lista
    const dataList = await this.apiService.get('profile/deliveries-with-token?token=' + this.token + '&delivery_id=' + this.deliveryID).toPromise<any>();
    this.list = dataList.data;

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
          this.items.push(med);
        });
      });
    }

    // obtenemos información del cliente
    const profileUrl =  'payments/get-profile?token=' + this.token + '&delivery_id=' + this.deliveryID;
    const profile = await this.apiService.get(profileUrl).toPromise<any>();
    this.profile = profile.data;

    this.list.delivery_date_input = moment(this.list.delivery_date).locale("es").format('LL');
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
