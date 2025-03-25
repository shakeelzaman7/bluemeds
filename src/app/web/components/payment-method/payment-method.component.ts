import {Component, Input, OnInit, HostListener, Output, EventEmitter} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResourcesService} from 'src/app/core/data/resources/resources-service.service';
import {ApiService} from 'src/app/core/api/api.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../environments/environment';
import {MessageDialogComponent} from 'src/app/core/components/message-dialog/message-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoadingController} from '@ionic/angular';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {AuthService} from 'src/app/core/auth/auth.service';
import {Address} from 'src/app/models/address';
import {BillingInfo} from 'src/app/models/billing-info';
import {Personal} from '../../wizard-register/wizard-register.page';
import {ListService} from '../../services/list/list.service';
import {PaymentService} from 'src/app/core/data/resources/paymentService';
import {cardTypes} from 'src/app/models/payment-card-types';
import {ConfirmationDialogComponent} from 'src/app/core/components/confirmation-dialog/confirmation-dialog.component';
import {ChangeDataFormService} from '../../services/components/change-data-form-service';
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;
const CHEVRON_UP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const VGSCollect: {
  create: (arg0: string, arg1: string, arg2: { (state: any): void; (state: any): void }) => any;
};

interface VGSTokenizationResponse {
  data: VGSTokenizationData;
  message: string;
  success: boolean
}

interface VGSTokenizationData {
  card_holder_id: string;
  card_holder_name: string;
  card_num_token: string;
  card_type: string;
  cvv_token: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  expiration_date: string;
  id: string;
  is_expired: boolean;
  last_four: string;
}

@Component({
  selector: 'app-component-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({height: '0', opacity: 0})), // Estado inicial (elemento no existente)
      state('*', style({height: '*', opacity: 1})), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})
export class PaymentMethodComponent implements OnInit {
  @Input() showSaveButton = false;
  @Input() showExpansionPanels = false;
  @Input() subtitle = 'Completa la siguiente información para agregar un nuevo método de pago.';
  @Input() showTitle = true;
  @Input() askDefaultPayment = true;
  @Input() isOnWizard = false;
  @Input() addMethod = true;
  @Input() token: string = null;
  @Input() deliveryId: number = null;
  @Input() showUserEmail = false;
  @Output() paymentMethodSaved = new EventEmitter<boolean>();

  private saveChangesFormSubscription: Subscription;

  paymentMethodForm: FormGroup;
  formInitialState: any;

  cardType: { type: string; pattern: RegExp; format: RegExp; length: number[]; cvcLength: number[]; luhn: boolean };
  billing: BillingInfo = new BillingInfo();
  personal: Personal = {profile: {}} as any;
  address: Address = new Address();
  showDeliveryUser = true;
  saving: boolean;

  validationMessages = {
    cardNumber: {
      required: 'El campo es requerido.',
      pattern: 'El número de tarjeta no cumple con un formáto válido.',
      invalidCardNumber: 'El número de tarjeta no es válido.',
    },
    cardName: {
      required: 'Campo requerido.',
      pattern: 'El nombre de la tarjeta no es válido.',
      minlength: 'El nombre de la tarjeta debe ser al menos 4 caracteres.',
      maxlength: 'El nombre de la tarjeta debe ser menos de 100 caracteres.',
    },
    cardMonth: {
      required: 'Campo requerido.',
      pattern: 'El mes no es válido.',
      maxlength: 'El mes debe ser de 2 dígitos.',
      minlength: 'El mes debe ser de 2 dígitos.',
    },
    cardYear: {
      required: 'Campo requerido.',
      maxlength: 'El año debe ser de 2 dígitos.',
      minlength: 'El año debe ser de 2 dígitos.',
    },
    cvv: {
      required: 'Campo requerido.',
      maxlength: 'El CVV debe ser de 3 dígitos.',
      minlength: 'El CVV debe ser de 3 dígitos.',
    },
  };

  formPaymentVGS: any;
  state: any;

  constructor(
    private api: ApiService,
    private loading: LoadingController,
    private formBuilder: FormBuilder,
    private resourceResource: ResourcesService,
    private snackBar: MatSnackBar,
    public layoutService: LayoutService,
    private matDialog: MatDialog,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private listService: ListService,
    public changeDataFormService: ChangeDataFormService,
    private authService: AuthService,
    private router: Router
  ) {
    iconRegistry.addSvgIconLiteral(
      'chevron-down',
      sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN)
    );
    iconRegistry.addSvgIconLiteral(
      'chevron-up',
      sanitizer.bypassSecurityTrustHtml(CHEVRON_UP)
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    if (this.changeDataFormService.getChangeData) {
      event.preventDefault();
    }
  }

  async ngOnInit() {
    const loading = await this.loading.create({
      message: 'Cargando...',
    });
    loading.present();

    try {
      this.paymentMethodForm = this.formBuilder.group({
        cardNumber: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?:\\d[ -]*?){13,16}$'),
          ],
        ],
        cardName: [
          '',
          [
            Validators.required,
            Validators.pattern('^((?:[A-Za-z]+ ?){1,3})$'),
            Validators.minLength(4),
            Validators.maxLength(100),
          ],
        ],
        cardMonth: [
          '',
          [
            Validators.required,
            Validators.pattern('^(0?[1-9]|1[012])$'),
            Validators.maxLength(2),
            Validators.minLength(2),
          ],
        ],
        cardYear: [
          '',
          [Validators.required, Validators.maxLength(2), Validators.minLength(2)],
        ],
        cvv: ['', [Validators.required]],
      });
      this.formInitialState = this.paymentMethodForm.value;

      await this.start();

      // Suscribe al evento de cambios en el formulario
      this.paymentMethodForm.valueChanges.subscribe(() => {
        if (this.hasChanged()) {
          this.changeDataFormService.markChangePending();
        } else {
          this.changeDataFormService.resetChange();
        }
      });

      this.saveChangesFormSubscription = this.changeDataFormService.getSaveChanges().subscribe(() => {
        this.onSubmit(true);
      });

      loading.dismiss();
    } catch (error) {
      loading.dismiss();
    }
  }

  ngOnDestroy() {
    if (this.saveChangesFormSubscription) {
      this.saveChangesFormSubscription.unsubscribe(); // Desuscribirse del evento de guardar cambios en el formulario del servicio
    }
  }

  public checkCardType() {
    this.cardType = cardTypes.patterns.find(p =>
      (this.paymentMethodForm.get('cardNumber').value.trim().replace(' ', '')).match(p.pattern)
    );
  }

  onCVVInput(event: Event): void {
    const maxDigits = this.cardType.cvcLength[0];
    this.paymentMethodForm.get('cvv').setValidators([Validators.required, Validators.maxLength(maxDigits), Validators.minLength(maxDigits)]);

    this.validateOnlyNumberDigits(event, maxDigits);
  }

  isCVVInvalid(): boolean {
    const cvvControl = this.paymentMethodForm.get('cvv');
    return cvvControl?.invalid && cvvControl?.touched;
  }

  public async onSubmit(customize?: boolean) {
    let defaultPayment = false;

    this.paymentMethodForm.markAllAsTouched();
    if (!this.paymentMethodForm.valid) {
      return false;
    }

    // Preguntamos si quiere establecer este método de pago como predeterminado
    if (this.askDefaultPayment) {
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
        if (result === null) {
          return;
        }
        if (result) {
          defaultPayment = true;
        }

        return await this.processPaymentData(customize, defaultPayment);
      });
    } else {
      defaultPayment = true;
      return await this.processPaymentData(customize, defaultPayment);
    }
  }

  private async submitFormVGS(addMethod: boolean): Promise<VGSTokenizationResponse> {
    const url = addMethod ? '/api/v1/tokens/cards' : '/api/v1/tokens/cards/tokenize-missing-2';

    const cardNumber = this.paymentMethodForm.get('cardNumber').value.trim().replace(/\s/g, '');
    let cardMonth = this.paymentMethodForm.get('cardMonth').value;

    if (Number(cardMonth) < 10) {
      cardMonth = '0' + cardMonth;
    }

    const data = {
      card_holder_id: this.personal.vivo_id,
      expiration_date: this.paymentMethodForm.get('cardMonth').value + '/20' + this.paymentMethodForm.get('cardYear').value,
      cvv: this.paymentMethodForm.get('cvv').value,
      card_num: cardNumber,
      card_type: this.cardType?.type ?? "",
      card_holder_name: this.paymentMethodForm.get('cardName').value,
      country_id: 1,
      commerce_id: environment.bluemedicalPaymentCommerceId,
      bin: cardNumber.substring(0, 6),
      last_four: cardNumber.slice(-4),
      billing_info: {
        country_id: 1,
        email: this.personal.email,
        phone: this.address.contactPhone.toString(),
        city_id: this.billing.addressToUse == 'addressCustom' ? this.billing.city_id : this.address.city_id,
        state_id: this.billing.addressToUse == 'addressCustom' ? this.billing.state_id : this.address.state_id,
        zip_code: this.billing.addressToUse == 'addressCustom' ? this.billing.zip_code : this.address.zip_code ?? '00000',
        address_one: this.billing.addressToUse == 'addressCustom' ? this.billing.address : this.address.address_line_1,
        address_two: ''
      }
    };

    return new Promise<VGSTokenizationResponse>((solve, reject) => {
      this.formPaymentVGS.submit(url, {
        headers: {
          Authorization: 'Bearer ' + environment.bluemedicalPaymentToken,
          'Accept-Language': 'es',
        },
        data,
      }, function(status, data) {
        if (data.success) {
          solve(data);
        } else {
          reject(data);
        }
      });
    });
  }

  async savePaymentsHistory(delivery_id: number, message: string, last_four_digits: string, status: string) {
    const url = this.isOnWizard ? 'profile/payment-methods/save-tokenization-request' : `payments/save-tokenization-request?token=${this.token}`;
    const delivery_id_send = this.isOnWizard ? delivery_id : this.deliveryId;

    await this.api.post(url, {
      delivery_id: delivery_id_send,
      message: message,
      last_4_digits: last_four_digits,
      status
    });
  }

  hasChanged(): boolean {
    const currentValue = this.paymentMethodForm.value;
    for (const key in currentValue) {
      if (currentValue.hasOwnProperty(key)) {
        if (currentValue[key] !== this.formInitialState[key]) {
          return true;
        }
      }
    }
    return false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.paymentMethodForm.get(controlName);
    for (const errorKey of Object.keys(this.validationMessages[controlName])) {
      if(controlName == 'cvv' && (control.hasError('maxlength') || control.hasError('minlength'))) {
        return 'El cvv debe ser de ' + this.cardType.cvcLength[0] + ' dígitos';
      }
      if (control.hasError(errorKey)) {
        return this.validationMessages[controlName][errorKey];
      }
    }
    return '';
  }

  validateCardNumber(event) {
    let value = event.target.value;
  
    // Eliminar cualquier carácter que no sea un número o espacio
    value = value.replace(/[^0-9 ]/g, '');
  
    // Asegurarse de que haya un espacio después de cada 4 dígitos
    value = value
      .replace(/\s/g, '') // Eliminar todos los espacios
      .replace(/(\d{4})/g, '$1 ') // Añadir un espacio cada 4 dígitos
      .trim(); // Eliminar espacios adicionales al final
  
    // Limitar a 16 dígitos + 3 espacios (máximo 19 caracteres)
    if (value.replace(/\s/g, '').length > 16 || (value.match(/\s/g) || []).length > 3) {
      event.preventDefault();
      value = value.slice(0, 19);
    }
  
    event.target.value = value;
  
    // Pasar al siguiente input si se alcanza el límite de 19 caracteres
    if (value.length === 19) {
      document.getElementById('nameCard').focus();
    }
  }
  
  // Validar con el Algoritmo de Luhn
  isValidCardNumber(event): boolean {
    let cardNumber = event.target.value;

    if (!cardNumber) return false;
  
    // Eliminar espacios y validar que sean solo números
    cardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cardNumber)) return false;
  
    let sum = 0;
    let alternate = false;
  
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
  
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
  
      sum += digit;
      alternate = !alternate;
    }
  
    const isValid = sum % 10 === 0;

    if (!isValid) {
      this.paymentMethodForm.get('cardNumber').setErrors({ invalidCardNumber: true });
    } else {
      this.paymentMethodForm.get('cardNumber').setErrors(null);
    }
  
    return isValid;
  }

  validateOnlyNumberDigits(event: any, maxLength: number) {
    let value = event.target.value;
  
    // Eliminar caracteres que no sean números
    value = value.replace(/[^0-9]/g, '');
  
    // Limitar a maxLength dígitos
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
  
    event.target.value = value;
  }

  setFocus(event: any, inputToJump: string) {
    // luego de escribir dos dígitos saltamos al siguiente input
    if (event.target.value.length === 2) {
      document.getElementById(inputToJump).focus();
    }
  }

  validateNotSpaces(event) {
    // validamos que el usuario no ingrese el esapcio, sino que lo haga el input automáticamente
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  private async processPaymentData(customize: boolean, defaultPayment: boolean) {
    try {
      if (this.addMethod && !this.isOnWizard) {
        if (this.token === null && this.deliveryId === null) {
          throw new Error('No se pudo obtener el id del usuario');
        }
        // antes de enviar la petición validamos nuevamente el token y el deliveryId
        let token_validated = await this.authService.isAuthenticatedNoLogin(this.token, this.deliveryId.toString());
        if (!token_validated) {
          throw new Error('Token inválido, comuníquese con un asesor o agente para obtener un nuevo enlace de pago.');
        }
      }

      this.saving = true;
      const data = await this.submitFormVGS(this.addMethod);
      this.savePaymentsHistory(this.listService.deliveryId, data.message, data.data.last_four, 'success');

      const cc: string = this.paymentMethodForm.get('cardNumber').value.trim().replace(/\s/g, '');
      const hint = '************' + cc.slice(-4);

      if (this.addMethod) {
        if (this.isOnWizard) {
          await this.listService.storePaymentData({
            card_number_hint: hint,
            expiration_date: data.data.expiration_date,
            card_type: data.data.card_type,
            payment_medium_token_id: data.data.id,
            card_holder_name: data.data.card_holder_name,
            complies: true,
            default: defaultPayment
          });
        } else {
          await this.api.post('payments/payment-method/save-with-token?token=' + this.token + '&delivery_id=' + this.deliveryId, {
            card_number_hint: hint,
            expiration_date: data.data.expiration_date,
            card_type: data.data.card_type,
            payment_medium_token_id: data.data.id,
            card_holder_name: data.data.card_holder_name,
            complies: true,
            default: defaultPayment
          });
        }
      }

      if (customize) {
        this.matDialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '450px',
          data: {
            title: '¡Tus datos han sido actualizados con éxito!',
            textButton: 'Aceptar',
            typeMessage: 'success',
          },
        }).afterClosed().subscribe(async () => {
          if (!this.isOnWizard) {
            // redirigimos al login
            await this.router.navigate(['/web/login']);
          }
        });

        this.changeDataFormService.resetChange();
      }

      this.paymentMethodSaved.emit(true);
      this.paymentMethodForm.reset(); // limpiamos el formulario
      this.saving = false;
      return true;
    } catch (exception) {
      let errorMessage = exception.message || 'Ha ocurrido un error';
      const cardNumber = this.paymentMethodForm.get('cardNumber').value.trim().replace(/\s/g, '');

      this.savePaymentsHistory(this.listService.deliveryId, errorMessage, cardNumber.slice(-4), 'failure');

      if (errorMessage === 'Usuario en lista negra.') {
        errorMessage = 'Su suscripción no puede ser procesada.';
      }

      if(errorMessage === 'Error al guardar tarjeta: CAMPOPRIMARYACCTNUM INVALIDO') {
        errorMessage = 'Verifique que el número de la tarjeta sea correcto o que no sea internacional.';
      }

      this.snackBar.open(errorMessage, null, {
        duration: 15000,
        panelClass: 'bg-danger',
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });

      this.paymentMethodSaved.emit(false);
      this.saving = false;
      return false;
    }
  }

  private async start() {
    await this.initializeVGSForm();

    await this.getProfileAddressAndBillingInfo(this.isOnWizard);
  }

  private async initializeVGSForm() {
    const vault = environment.bluemedicalPaymentVault;
    const formPaymentVGS = await VGSCollect.create(vault, environment.bluemedicalPaymentEnvironment, (state: any) => {
      this.state = state;
    });

    formPaymentVGS.field('#card-number', {
      name: 'cc-number',
      type: 'card-number',
      placeholder: 'Card number',
      autoComplete: 'cc-number',
    });

    formPaymentVGS.field('#card-cvv', {
      name: 'cc-cvv',
      type: 'card-security-code',
      placeholder: 'CVV',
    });

    this.formPaymentVGS = formPaymentVGS;
  }

  private async getProfileAddressAndBillingInfo(isLoggedIn: boolean) {
    await this.getProfile(isLoggedIn);
    await this.getAddress(isLoggedIn);
    await this.getBillingInfo(isLoggedIn);
  }

  private async getProfile(isLoggedIn: boolean) {
    const profileUrl = isLoggedIn ? 'profile' : 'payments/get-profile?token=' + this.token + '&delivery_id=' + this.deliveryId;
    const personal = await this.api.get(profileUrl, {}).toPromise<any>();
    if (personal.data) {
      this.personal = personal.data;
    }
  }

  private async getAddress(isLoggedIn: boolean) {
    if (isLoggedIn) {
      const addresses = (await this.resourceResource.getResource(Address).index()).data; // obtenemos los datos de address
      if (addresses.length > 0) {
        this.address = addresses[0];
      }
    } else {
      const addresses = (await this.api.get(
        'payments/get-address-or-billing?token=' + this.token + '&delivery_id=' + this.deliveryId + '&type=address',
        {}
      ).toPromise<any>());
      if (addresses.data) {
        if (addresses.data.length > 0) {
          this.address = addresses.data[0];
          this.address.contactPhone = addresses.data[0].contact_phone;
        }
      }
    }
  }

  private async getBillingInfo(isLoggedIn: boolean) {
    if (isLoggedIn) {
      const billings = (await this.resourceResource.getResource(BillingInfo).index()).data;
      if (billings.length > 0) {
        this.billing = billings[0];
        this.billing.city_id = this.billing.city_id ? this.billing.city_id.toString() : '21347';
        this.billing.state_id = this.billing.state_id ? this.billing.state_id.toString() : '782';
      }
    } else {
      const billings = (await this.api.get(
        'payments/get-address-or-billing?token=' + this.token + '&delivery_id=' + this.deliveryId + '&type=billing',
        {}
      ).toPromise<any>());
      if (billings.data) {
        if (billings.data.length > 0) {
          this.billing = billings.data[0];
          this.billing.city_id = this.billing.city_id ? this.billing.city_id.toString() : '21347';
          this.billing.state_id = this.billing.state_id ? this.billing.state_id.toString() : '782';
        }
      }
    }
  }

  // Esta función nos ayudará a saber si al mostrar el formulario hay cambios entonces marcar nuestro servicio de cambios
  verifyHasChanges() {
    if (this.hasChanged()) {
      this.changeDataFormService.markChangePending();
    }
  }
}
