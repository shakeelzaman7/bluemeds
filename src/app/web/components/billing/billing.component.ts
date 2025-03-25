// Angular Core Imports
import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

// Angular Material Imports
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {MatAccordion} from '@angular/material/expansion';
import {animate, state, style, transition, trigger} from '@angular/animations';

// Service and Model Imports
import {ApiService} from 'src/app/core/api/api.service';
import {ResourcesService} from 'src/app/core/data/resources/resources-service.service';
import {BillingInfo} from 'src/app/models/billing-info';
import {State} from 'src/app/models/state';
import { ChangeDataFormService } from '../../services/components/change-data-form-service';

// Environment and Component Imports
import {MessageDialogComponent} from 'src/app/core/components/message-dialog/message-dialog.component';
import {PaymentService} from 'src/app/core/data/resources/paymentService';
import {ListService} from '../../services/list/list.service';
import {Address} from 'src/app/models/address';
import {PaymentMethodComponent} from "../payment-method/payment-method.component";
import { Subscription } from "rxjs";
import {LoadingController} from '@ionic/angular';

const EXCLAMATION_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.713T12 7q-.425 0-.713.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/></svg>`;

/**
 * Component for managing billing information, allowing users to update their billing data.
 */
@Component({
  selector: 'app-component-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})
export class BillingComponent implements OnInit {
  @ViewChild('inputCardName') inputCardName: ElementRef;
  @ViewChild('inputExpirationYear') inputExpirationYear: ElementRef;
  @ViewChild('inputCvc') inputCvc: ElementRef;
  @ViewChild('paymentLinkInput') paymentLinkInput: ElementRef;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(PaymentMethodComponent) paymentComponent: PaymentMethodComponent;

  @Input() showSaveButton: boolean = false;
  @Input() showPaymentMethod: boolean = false;
  @Input() confirmSubError = false;

  private saveChangesFormSubscription: Subscription;

  list: any;
  showPaymentForm: boolean = false;
  billingForm: FormGroup;
  paymentGroup: FormGroup;
  formInitialState: any;
  billing: BillingInfo = new BillingInfo();
  states: State[] = [];
  cities: any[] = [];
  citiesAddress: any[] = [];
  showErrorMessageAddress: boolean;
  addresToUseText: string;
  zipcode: { isList: boolean; zip_code: any; zone: any; };
  savedPaymentData: { card_type: string, card_number_hint: string, expiration_date: string } = null;
  isLinkCopied = false;
  isPanelOpen = false;
  validationMessages = {
    personalIdentityNumber: {
      required: 'Campo requerido.'
    },
    name: {
      required: 'Campo requerido.'
    },
    address: {
      required: 'Campo requerido.'
    },
    userId: {
      required: 'Campo requerido.'
    },
    state_id: {
      required: 'Campo requerido.'
    },
    city_id: {
      required: 'Campo requerido.'
    },
    zip_code: {
      required: 'Campo requerido.'
    },
    addressToUse: {
      required: 'Campo requerido.'
    }
  }
  address: Address;

  constructor(
    private apiService: ApiService,
    private listService: ListService,
    private paymentService: PaymentService,
    private formBuilder: FormBuilder,
    private resourcesService: ResourcesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public changeDataFormService: ChangeDataFormService,
    iconRegistry: MatIconRegistry,
    private loadingController: LoadingController
  ) {
    iconRegistry.addSvgIconLiteral('exclamation-info', sanitizer.bypassSecurityTrustHtml(EXCLAMATION_INFO));
  }

  /**
   * Initialization hook that sets up the billing form and loads initial data.
   */
  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });

    loading.present();

    try {
      this.setupBillingForm();
      this.list = await this.listService.getlist();
      await this.loadInitialData();

      this.formInitialState = this.billingForm.value;

      this.billingForm.valueChanges.subscribe(() => {
        this.hasChanged() ? this.changeDataFormService.markChangePending() : this.changeDataFormService.resetChange();
      });

      //Suscribirse al evento del servicio de cambio de datos para guardar los cambios
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

  /**
   * Sets up the billing form with validators and default values.
   */
  private setupBillingForm(): void {
    this.paymentGroup = this.formBuilder.group({
      cardNumber: [null],
      cardName: [null],
      cardExpirationMonth: [null],
      cardExpirationYear: [null],
      cardCvc: [null],
    });

    this.billingForm = this.formBuilder.group({
      personalIdentityNumber: ['', Validators.required],
      name: ['', Validators.required],
      address: [null],
      state_id: [null],
      city_id: [null],
      zip_code: [null],
      addressToUse: [null, Validators.required]
    });

    // Observe changes to the address to use and update the form validators accordingly.
    this.billingForm.get('addressToUse').valueChanges.subscribe(value => {
      if (value === 'addressCustom') {
        this.billingForm.get('state_id').setValidators(Validators.required);
        this.billingForm.get('city_id').setValidators(Validators.required);
        this.billingForm.get('zip_code').setValidators(Validators.required);
        this.billingForm.get('address').setValidators(Validators.required);
      } else {
        this.billingForm.get('state_id').clearValidators();
        this.billingForm.get('city_id').clearValidators();
        this.billingForm.get('zip_code').clearValidators();
        this.billingForm.get('address').clearValidators();
      }
      // Update the validity of the fields based on the new validators.
      this.billingForm.get('state_id').updateValueAndValidity();
      this.billingForm.get('city_id').updateValueAndValidity();
      this.billingForm.get('zip_code').updateValueAndValidity();
      this.billingForm.get('address').updateValueAndValidity();
    });

    this.formInitialState = this.billingForm.value;
  }

  /**
   * Loads the initial data required for the form, like states and existing billing information.
   */
  private async loadInitialData(): Promise<void> {
    await this.loadStates();
    await this.loadExistingBillingInfo();
    await this.loadExistingPaymentData();
  }

  /**
   *
   */
  private async loadExistingAddressInfo (): Promise<void>  {
    try {
      const addresses = (await this.resourcesService.getResource(Address).index()).data;

      if (addresses.length > 0) {
        this.address = addresses[0];

        // Find the department name using the state ID from the billing information.
        const department = this.states.find(state => state.id === (this.address.state_id ? this.address.state_id : 0))?.name || '';

        // Load the cities for the selected state.
        if (this.address.state_id){
          await this.loadCitiesByAddress(this.address.state_id);
        }

        // Find the municipality name using the city ID from the billing information.
        const municipality = this.citiesAddress.find(city => city.id === (this.address.city_id ? this.address.city_id : 0))?.name || '';

        // Use the zip code from the billing information, if available.
        const zipCode = this.address.zip_code || '';

        this.setAddresToUseText(department, municipality, zipCode, this.address.address_line_1);
      }
    } catch (error) {
      this.handleApiError(error, 'Failed to load states.');
    }
  }

  /**
   * Fetches the list of states from the backend and updates the form.
   */
  private async loadStates(): Promise<void> {
    try {
      this.states = await this.paymentService.fetchStates();
    } catch (error) {
      this.handleApiError(error, 'Failed to load states.');
    }
  }

  /**
   * Loads existing billing information, if available, and updates the form.
   */
  private async loadExistingBillingInfo(): Promise<void> {
    try {
      const billingInfo = (await this.resourcesService.getResource(BillingInfo).index()).data;

      if (billingInfo.length > 0) {
        this.billing = billingInfo[0];
        this.billingForm.patchValue(this.billing);

        if (this.list.billing_same_as_address) {
          this.billingForm.patchValue({ addressToUse: 'addressDelivery' });
          this.loadExistingAddressInfo();
        } else {
          this.billingForm.patchValue({ addressToUse: 'addressCustom' });
        }

        if (this.billingForm.value.state_id){
          await this.loadCities(this.billing.state_id);
        }

        //
        if (this.billingForm.value.zip_code !== null){
          this.billingForm.get('zip_code').disable()
        }
      }
    } catch (error) {
      this.handleApiError(error, 'No se pudo cargar la información de facturación.');
    }
  }

  /**
   * Loads existing payment data, if available, and updates the form.
   */
  async loadExistingPaymentData() {
    try {
      const paymentDatas = await this.listService.getPaymentData();

      if (paymentDatas.data.length > 0) {
        this.savedPaymentData = paymentDatas.data[paymentDatas.data.length - 1];
      }
    } catch (error) {
      this.handleApiError(error, 'No se pudo cargar la información de métodos de pago.');
    }
  }

  /**
   * Event handler for state change, updates city list based on selected state.
   * @param {Event} event - The event object from the state selection input.
   */
  onStateChange(event: any): void {
    this.loadCities(event.target.value);
  }

  /**
   * Fetches cities for the selected state and updates the form.
   * @param stateId State ID for which cities are to be fetched.
   */
  private async loadCities(stateId: string): Promise<void> {
    try {
      this.cities = await this.paymentService.fetchCities(stateId);
    } catch (error) {
      this.handleApiError(error, 'Failed to load cities.');
    }
  }

  /**
   * Fetches cities for the selected state and updates the form.
   * @param stateId State ID for which cities are to be fetched.
   */
  private async loadCitiesByAddress(stateId: string): Promise<void> {
    try {
      this.citiesAddress = await this.paymentService.fetchCities(stateId);
    } catch (error) {
      this.handleApiError(error, 'Failed to load cities.');
    }
  }

  /**
   * Submits the form, updating the billing information.
   */
  async onSubmit(customize?: boolean): Promise<boolean> {
    this.billingForm.markAllAsTouched();

    if (!this.billingForm.valid) {
      this.snackBar.open('Por favor corrige los errores en el formulario.', 'Cerrar',
        { duration: 3000, panelClass: 'bg-danger',
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

      return false;
    }

    let billingRes = await this.onSubmitBilling(); // guardamos la información de facturación

    if (!billingRes) {
      this.showDialogMessage('¡Error al actualizar información de datos de facturación!', 'error');
      return false;
    }

    let paymentRes = await this.onSubmitPayment(); // guardamos la tarjeta si se ha ingresado

    if (customize && billingRes && paymentRes) {
      this.showDialogMessage('¡Tus datos han sido actualizados con éxito!', 'success');
      this.formInitialState = this.billingForm.value;
      this.changeDataFormService.resetChange();
    }

    return paymentRes && billingRes;
  }

  async onSubmitBilling() {
    try {
      this.billing.personalIdentityNumber = this.billingForm.value.personalIdentityNumber;
      this.billing.name = this.billingForm.value.name;
      this.billing.address = this.billingForm.value.address;
      this.billing.userId = this.billingForm.value.userId;
      this.billing.state_id = this.billingForm.value.state_id;
      this.billing.city_id = this.billingForm.value.city_id;
      this.billing.zip_code = this.billingForm.getRawValue().zip_code;
      this.billing.addressToUse = this.billingForm.value.addressToUse;

      if (this.billingForm.value.addressToUse === 'addressDelivery') {
        this.billing.state_id = this.address.state_id;
        this.billing.city_id = this.address.city_id;
        this.billing.zip_code = this.address.zip_code;
        this.billing.address = this.address.address_line_1;
      }

      if (this.billing.id) {
        await this.resourcesService.getResource(BillingInfo).update(this.billing);
      } else {
        await this.resourcesService.getResource(BillingInfo).store(this.billing);
      }

      return true;
    } catch (error) {
      this.handleApiError(error, 'Error al actualizar información de datos de facturación.');
      return false;
    }
  }

  onSubmitPayment() {
    if (!this.showPaymentMethod) {
      return true;
    }

    // si showPaymentMethod es true y no se tiene desplegado el formulario o se tiene registrado algún método de pago mostramos mensaje de que complete su información de pago
    if (!this.showPaymentForm && !this.savedPaymentData) {
      this.showDialogMessage('Asegúrate de tener completa toda tu información de pago', 'error');
      return false;
    }

    if (this.showPaymentForm) {
      return this.paymentComponent.onSubmit();
    } else {
      return this.savedPaymentData;
    }
  }

  /**
   * Shows a success dialog with a given message.
   * @param message Success message to display.
   * @param typeMessage Type of message to display.
   */
  private showDialogMessage(message: string, typeMessage: string = 'success'): void {
    this.dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '450px',
      data: {
        title: message,
        textButton: 'Aceptar',
        typeMessage: typeMessage
      }
    });
  }

  /**
   * Generic method to handle API errors, displaying a message using MatSnackBar.
   * @param error The error object received from the API call.
   * @param defaultMessage Default error message if the error object doesn't contain a message.
   */
  private handleApiError(error: any, defaultMessage: string): void {
    const errorMessage = error?.error?.message || defaultMessage;
    this.snackBar.open('Error en datos de facturación: ' + errorMessage, 'Cerrar', { duration: 6000, panelClass: 'bg-danger', horizontalPosition: 'center', verticalPosition: 'top' });
  }

  /**
   * Prevents navigation if there are unsaved changes.
   */
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (this.changeDataFormService.getChangeData) {
      event.preventDefault();
    }
  }

  /**
   * Checks if the form has been changed from its initial state.
   * @returns True if the form has changed, false otherwise.
   */
  private hasFormChanged(): boolean {
    return JSON.stringify(this.billingForm.value) !== JSON.stringify(this.formInitialState);
  }

  /**
   * Sets the address to use text by concatenating municipality, department, zip code, and address.
   * This method constructs a billing address from the delivery address details.
   * @param {string} department - The department of the address.
   * @param {string} municipality - The municipality of the address.
   * @param {string} zipCode - The zip code of the address.
   * @param {string} address - The address line of the address.
   */
  setAddresToUseText(department: string, municipality: string, zipCode: string, address: string): void {
    // Concatenate the details to form the address to use text, separated by commas.
    this.addresToUseText = `${municipality}, ${department}, ${zipCode}, ${address}`;
  }

  /**
   * Handles the selection of the address to use based on the user's choice.
   */
  selectAddressToUse() {
    // If the user selects 'addressDelivery' as the address to use, set the address text accordingly.
    if (this.billingForm.value.addressToUse === 'addressDelivery') {
      this.loadExistingAddressInfo();
    }

    // Hide any error messages related to address selection.
    this.showErrorMessageAddress = false;
  }

  /**
   * Fetches the zipcode information for a given city ID.
   * @param {string} cityId - The ID of the city for which to fetch the zip code.
   * @returns {Object|null} An object containing the zip code information or null if not found or in case of an error.
   */
  async getZipcode(cityId) {
    if (!cityId) {
      return null; // Return null immediately if no city ID is provided.
    }

    try {
      const zipCodeResponse = await this.paymentService.fetchZipcode(cityId);

      // Check if zip code data is present in the response.
      if (zipCodeResponse.zip_codes && zipCodeResponse.zip_codes.length > 0) {
        // Determine whether to return a list of zip codes or a single zip code based on the response.
        const isMultiple = zipCodeResponse.zip_codes.length > 1 || (zipCodeResponse.zones && zipCodeResponse.zones.length > 0);
        return {
          isList: isMultiple,
          zip_code: isMultiple ? zipCodeResponse.zip_codes : zipCodeResponse.zip_codes[0].id,
          zone: zipCodeResponse.zones
        };
      } else {
        return null; // Return null if no zip codes are found.
      }
    } catch (error) {
      return null; // Return null in case of an error.
    }
  }

  /**
   * Handles changes to the selected city by updating the zip code information.
   * @param {Event} event - The event object from the city selection input.
   * @param value
   */
  async onZipCodeChange(event?: any, value?: string | number) {
    this.billingForm.get('zip_code').setValue(null);

    // Fetch the zip code information based on the selected city ID.
    this.zipcode = await this.getZipcode(event?.target.value ?? value);

    if (!this.zipcode) {
      this.billingForm.patchValue({ zip_code: null });
    }

    if (this.zipcode) {
      // Update the zip code input based on the zip code information.
      this.billingForm.patchValue({
        zip_code: !this.zipcode.isList ? this.zipcode.zip_code : this.zipcode.zip_code[0].id
      });

      !this.zipcode.isList ? this.billingForm.get('zip_code').disable() : this.billingForm.get('zip_code').enable();
    }
  }

  async copyToClipBoard(inputElement: HTMLInputElement) {
    const value = inputElement.value;

    inputElement.select();
    this.isLinkCopied = true;
    await navigator.clipboard.writeText(value);
    this.snackBar.open('¡El texto ha sido copiado al portapapeles!', 'Cerrar', { duration: 3000 });
  }

  hasChanged(): boolean {
    const currentValue = this.billingForm.value;
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
    const control = this.billingForm.get(controlName);
    for (const errorKey of Object.keys(this.validationMessages[controlName])) {
      if (control.hasError(errorKey)) {
        return this.validationMessages[controlName][errorKey];
      }
    }
    return '';
  }

  toogleShowPaymentForm() {
    this.showPaymentForm = !this.showPaymentForm;
    this.accordion.closeAll()
  }

  async getLinkPayment() {
    let response = await this.apiService.get('payments/get-link-to-save-payment/' + this.list.id + '/add-payment').toPromise().then((response: any) => {
      return response.data;
    }).catch((error) => {
      return [];
    });

    this.paymentLinkInput.nativeElement.value = response.url_notification;

    this.showPaymentForm = false;

    await this.onSubmitBilling();
  }
}
