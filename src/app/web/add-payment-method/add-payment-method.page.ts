import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.page.html',
  styleUrls: ['./add-payment-method.page.scss'],
})
export class AddPaymentMethodPage implements OnInit {
  public token: string;
  public deliveryID: number;
  public typeForm: string;

  constructor(
    private route: ActivatedRoute,
    protected router: Router
    ) {
    this.route.queryParams.subscribe(params => {
      this.token = params.token;
      this.deliveryID = params.delivery_id;
      this.typeForm = params.type_form;
    });
  }

  ngOnInit() {
  }

  public shouldAddMethod(): boolean {
    switch (this.typeForm) {
      case 'add-payment':
        return true;
      default:
        return false;
    }
  }
}
