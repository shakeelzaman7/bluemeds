import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { PaymentMethodComponent } from "../components/payment-method/payment-method.component";
import { Router } from "@angular/router";
import { ApiService } from "../../core/api/api.service";
import { Title } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface PaymentData {
  complies: boolean;
  complies_min_time: boolean;
  complies_bluemeds_service: boolean;
  advisor_number: number[];
}

@Component({
  selector: 'app-confirm-subscription',
  templateUrl: './confirm-subscription.page.html',
  styleUrls: ['./confirm-subscription.page.scss'],
})

export class ConfirmSubscriptionPage implements OnInit {
  @ViewChild(PaymentMethodComponent) paymentMethodComponent: PaymentMethodComponent;
  showTermsAndConditions: boolean = false;
  paymentData: PaymentData = {
    complies: false,
    complies_min_time: false,
    complies_bluemeds_service: false,
    advisor_number: [],
  };
  saving: boolean = false;

  public token: string;
  public deliveryID: number;
  public typeForm: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private apiService: ApiService,
              private titleService: Title,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params.token;
      this.deliveryID = params.delivery_id;
      this.typeForm = params.type_form;
    }, error => {
      //
    });
  }

  async confirmSubscription() {
    try {
      this.saving = true;
      let response = await this.paymentMethodComponent.onSubmit(false);

      if (!response) {
        return;
      }

      await this.confirmSubscriptionAPI();

      await this.router.navigate(['web/success-subscription'], {
        queryParams: {
          token: this.token,
          delivery_id: this.deliveryID,
          type_form: this.typeForm,
        }
      });

      this.titleService.setTitle(`Bluemeds - Suscripción exitosa`);
      this.saving = false;
    } catch (error) {
      this.snackBar.open("Error al confirmar la suscripción: " + error?.error?.message, null, {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['bg-danger', 'rounded-full', 'font-semibold'],
      });

      this.saving = false;
    }
  }

  async confirmSubscriptionAPI() {
    const url = `subscriptions-success-with-token/${this.deliveryID}?token=${this.token}`;
    return await this.apiService.get(url).toPromise();
  }
}
