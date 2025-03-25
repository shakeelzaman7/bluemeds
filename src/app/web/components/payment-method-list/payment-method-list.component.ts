import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {ResourcesService} from 'src/app/core/data/resources/resources-service.service';
import {ApiService} from 'src/app/core/api/api.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import {MatDialog} from '@angular/material/dialog';
import {PaymentMethod} from 'src/app/models/payment-method';
import {animate, state, style, transition, trigger,} from '@angular/animations';
import {AuthService} from 'src/app/core/auth/auth.service';
import {ListService} from '../../services/list/list.service';
import {PaymentService} from 'src/app/core/data/resources/paymentService';
import { MessageDialogComponent } from 'src/app/core/components/message-dialog/message-dialog.component';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import {ConfirmationDialogComponent} from "../../../core/components/confirmation-dialog/confirmation-dialog.component";


declare const VGSCollect;

interface VGSTokenizationResponse {
  card_holder_id: string;
  card_holder_name: string;
  card_num_token: string;
  card_type: string;
  cvv_token: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  expiration_date: string;
  id: string;
  is_expired: boolean;
}

@Component({
  selector: 'app-component-payment-method-list',
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})

export class PaymentMethodListComponent implements OnInit {
  @Input() showTitle = false;
  @Input() key = 0;
  @Input() showSaveButton = false;
  @Input() showExpansionPanels = false;
  @Input() subtitle =
    'Completa la siguiente información para agregar un nuevo método de pago.';

  @Output() paymentMethodLoaded = new EventEmitter<number>();
  @Output() paymentMethodUpdated = new EventEmitter<any>();

  availablePaymentMethods: PaymentMethod[] = [];
  allPaymentMethods: PaymentMethod[] = [];
  defaultPaymentMethod: PaymentMethod;
  delivery: any = null;
  form: any;
  state: any;

  private createVgsForm() {
    const vault = environment.bluemedicalPaymentVault;
    const form = VGSCollect.create(
      vault, environment.bluemedicalPaymentEnvironment,
      (state: any) => {
        this.state = state;
      }
    );

    form.field('#card-number', {
      name: 'cc-number',
      type: 'card-number',
      placeholder: 'Card number',
      autoComplete: 'cc-number',
    });

    form.field('#card-cvv', {
      name: 'cc-cvv',
      type: 'card-security-code',
      placeholder: 'CVV',
    });
    this.form = form;
  }


  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private resourceResource: ResourcesService,
    public layoutService: LayoutService,
    private matDialog: MatDialog,
    private authService: AuthService,
    private listService: ListService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    await this.start();
  }

  async start() {
    await this.getListInfo();
    await this.loadPaymentMethods();

    if (!this.form) {
      this.createVgsForm();
    }
  }

  ngOnChanges(changes: any) {
    if (changes.key?.previousValue !== 0 && changes.key?.previousValue !== undefined ) {
      this.loadPaymentMethods();
    }
  }

  public async getListInfo() {
    this.delivery = await this.listService.getlist();
  }

  /**
   * Loads the payment methods from the server and updates the component's state.
   *
   * @returns A promise that resolves when the payment methods are loaded.
   */
  public async loadPaymentMethods(): Promise<void> {
    const paymentMethods = (
      await this.resourceResource.getResource(PaymentMethod).index()
    ).data;
    this.allPaymentMethods = await this.getExtraDataPayments(paymentMethods);
    this.organizePaymentMethods();
    this.paymentMethodLoaded.emit(this.allPaymentMethods.length);
  }

  /**
   * Retrieves extra data for each payment method.
   *
   * @param paymentMethods - An array of payment methods.
   * @returns A promise that resolves to the updated array of payment methods with extra data.
   */
  public async getExtraDataPayments(
    paymentMethods: PaymentMethod[]
  ): Promise<PaymentMethod[]> {
    const promises = paymentMethods.map(async (paymentMethod) => {
      paymentMethod.extra_data = await this.paymentService.getPaymentData(paymentMethod.payment_medium_token_id);
      return paymentMethod;
    });
    return Promise.all(promises).catch((error) => {
      return paymentMethods;
    });
  }

  public async handleChangedPaymentMethod(selectedPaymentMethod: PaymentMethod){
    this.matDialog.open(ConfirmationDialogComponent, {
      width: '500px',
      panelClass: 'custom-padding-class-dialog',
      data: {
        message: 'Método de pago predeterminado.',
        question: '¿Desea definir este método de pago como predeterminado?',
        buttonText_1: 'No establecer',
        buttonText_2: 'Establecer predeterminado',
        showTitle: false,
      }
    }).afterClosed().subscribe(async (result) => {
      if (result) {
        await this.api.post('profile/payments/set-default-payment/' + this.delivery.id + '/' + selectedPaymentMethod.id, {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          delivery_id: this.delivery.id,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          payment_id: selectedPaymentMethod.id,
        }).then((response) => {
          this.matDialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '450px',
            data: {
              title: response.message,
              textButton: 'Aceptar',
              typeMessage: 'success',
            },
          });
        });
      }
      await this.loadPaymentMethods();
    });
  }

  public async handlePaymentMethodDeleted(paymentMethodDeleted: PaymentMethod) {
    await this.loadPaymentMethods();
  }

  private organizePaymentMethods() {
    this.defaultPaymentMethod = this.allPaymentMethods.find(
      (paymentMethod) => paymentMethod.default
    );
    this.availablePaymentMethods = this.allPaymentMethods.filter(
      (paymentMethod) => !paymentMethod.default
    );
  }

  public async handlePaymentMethodUpdate(paymentMethod: any) {
    await this.paymentService.updatePaymentMethod(paymentMethod);

    const data  = await this.api.put(`profile/payment-methods/${paymentMethod.id}`, {
      expiration_date: paymentMethod.expiration_date,
      name: paymentMethod.card_holder_name,
    }).toPromise();

    const alert = await this.alertCtrl.create({
      header: 'Método de pago',
      message: 'Hemos actualizado tu método de pago.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel',
        },
      ],
    });

    alert.present();
  }
}
