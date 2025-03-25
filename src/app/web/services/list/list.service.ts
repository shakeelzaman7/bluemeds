import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DeliveryItem } from 'src/app/models/delivery-item';
import { BudgetService } from '../../services/budget/budget.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  async addAttachment(item: any, name: string, file: File) {
    return this.upload(`profile/deliveries/${this.deliveryId}/item/${item.id}/documents`, {
      document_name: name,
      document_file: file
    });
  }


  async upload(endpoint: string, payload: any) {
    const formData = new FormData();
    for (let key in payload) {
      formData.append(key, payload[key]);
    }
    const http = new HttpClient(this.handler)
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Bearer " + this.authService.token.token)
    headers = headers.append("Accept", "application/json")
    return http.post(this.api.url + '/' + endpoint, formData, {
      headers: headers
    }).toPromise();
  }

  public list: any;
  public deliveryId: number;
  constructor(
    public authService: AuthService,
    private router: Router,
    private api: ApiService,
    private handler: HttpBackend,
    private snackbar: MatSnackBar,
    private budgetService: BudgetService) {

  }

  async deleteDeliveryItem(deliveryItemId: number) {
    return await this.api.delete("profile/deliveries/" + this.deliveryId + "/item/" + deliveryItemId).toPromise();
  }

  async update() {
    //TODO: deliveryID, not 1
    await this.api.patch("profile/deliveries/" + this.deliveryId, this.list.data).toPromise();
  }

  async updateDeliveryItem(deliveryItem: DeliveryItem) {
    //TODO: deliveryID, not 1
    let response = null;
    if (deliveryItem.id == null)
      response = await this.api.post("profile/deliveries/" + this.deliveryId + "/item/", deliveryItem);
    else
      response =  await this.api.patch("profile/deliveries/" + this.deliveryId + "/item/" + deliveryItem.id, deliveryItem).toPromise();

    return response;
  }

  async getPaymentData() {
    return await this.api.get("profile/payments").toPromise<any>();
  }

  async storePaymentData(paymentData: any) {
    //api/profile/payments
    return await this.api.post("profile/payments", paymentData);
  }

  async deletePaymentData(paymentDataId: any) {
    //api/profile/payments
    return await this.api.delete("profile/payments/" + paymentDataId).toPromise<any>();
  }

  async getlist() {
    this.list = await this.authService.list();
    this.deliveryId = this.list.data.id;
    return this.list.data;
  }

  async add(deliveryItem: DeliveryItem) {
    let res = null
    if (await this.authService.isAuthenticated()) {
      res = await this.updateDeliveryItem(deliveryItem);
      // this.router.navigateByUrl("/web/list")
    }

    return res;
  }

  async createDeliveryItem(deliveryId: number, deliveryItem: DeliveryItem) {
    await this.api.post("profile/deliveries/" + this.deliveryId + "/item/", deliveryItem);
  }

  async addBudgetToList(listId: number) {

    let budgetList = await this.budgetService.getItemsFromStorage();

    for(let item of budgetList) {

      let deliveryItem: DeliveryItem = new DeliveryItem();

      deliveryItem.stock_date = moment().format('YYYY-MM-DD');
      deliveryItem.portal_publication_id = item.portal_publication_id;
      deliveryItem.frequency_id = item.frequency_id;
      deliveryItem.frequency = item.frequency;
      deliveryItem.dose = item.dosage;
      deliveryItem.publication = item.publication;
      deliveryItem.quantity = item.quantity;

      await this.createDeliveryItem(listId,deliveryItem);
    }

  }

  async validateItemsByDay(itemsToValidate: any) {
    let itemsWarningShow = [];
    try {
      await this.api.post('profile/validate-items-day', {
        delivery_items: itemsToValidate
      });
    } catch (e) {
      /* dentro de e.error.errors vienen los índices de los items que no cumplen con la validación así "delivery_items.0.stock_date", lo que haremos será recorrer todos los items a validar dentro de
      itemsToValidateDate y si el índice coincide con el índice que viene en e.error.errors agregaremos el item al array itemsWarningDate para mostrarlo en el modal */
      itemsToValidate.forEach((item: any, index: number) => {
        if (e.error.errors.hasOwnProperty('delivery_items.' + index + '.delivery_day')) {
          itemsWarningShow.push(item);
        }
      });
    }

    return itemsWarningShow;
  }
}
