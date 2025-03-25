import { Component, Input, OnInit, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { ApiService } from 'src/app/core/api/api.service';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Address } from '../../../models/address';
import { MessageDialogComponent } from 'src/app/core/components/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LoadingController } from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { State } from "../../../models/state";
import { ChangeDataFormService } from '../../services/components/change-data-form-service';
import { AsYouType } from "libphonenumber-js";
import { Subscription } from "rxjs";
import { AuthService } from 'src/app/core/auth/auth.service';
import { ListService } from "../../services/list/list.service";
import { RestrictedAddresses } from 'src/app/@vex/interfaces/restricted-addresses';
import { capitalizeWords } from 'src/app/@vex/utils/capitalize';

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;
const CHEVRON_UP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;
const EXCLAMATION_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.713T12 7q-.425 0-.713.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/></svg>`;

@Component({
  selector: 'app-component-delivery-address',
  templateUrl: './delivery-address.component.html',
  styleUrls: ['./delivery-address.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})
export class DeliveryAddressComponent implements OnInit {
  @Input() showSaveButton: boolean = false;
  @Input() showExpansionPanels: boolean = false;
  @Input() subtitle: string = 'Entregaremos tus medicamentos en la dirección que nos indiques.';

  private saveChangesFormSubscription: Subscription;

  capitalizeWords = capitalizeWords;
  saving: boolean;
  deliveryAddressForm: FormGroup;
  formInitialState: any;
  address: Address = new Address();

  states: State[] = [];
  citiesAddress: any[] = [];
  zipCodeAdress: any;
  delivery: any;

  showDeliveryUser: boolean = true;
  showDeliveryAddress: boolean = true;
  showRedZones: boolean = false;
  redZonesData: RestrictedAddresses = { success: false, message: '', data: null };

  validationMessages = {
    namesAddress: {
      required: 'Campo requerido.',
      pattern: 'Solo se permiten letras.',
    },
    departmentAddress: {
      required: 'Campo requerido.',
    },
    municipalityAddress: {
      required: 'Campo requerido.',
    },
    addres_line_1: {
      required: 'Campo requerido.',
      maxlength: 'El máximo de caracteres a ingresar es 155.',
    },
    zipCodeSelect: {
      required: 'Campo requerido.',
    },
    zoneZipCodeId: {
      required: 'Campo requerido.',
    },
  };

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    private resourceResource: ResourcesService,
    private snackBar: MatSnackBar,
    private loading: LoadingController,
    public layoutService: LayoutService,
    private matDialog: MatDialog,
    iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
    public changeDataFormService: ChangeDataFormService,
    private listService: ListService
  ) {
    iconRegistry.addSvgIconLiteral(
      'chevron-down',
      sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN)
    );
    iconRegistry.addSvgIconLiteral(
      'chevron-up',
      sanitizer.bypassSecurityTrustHtml(CHEVRON_UP)
    );

    iconRegistry.addSvgIconLiteral('exclamation-info', sanitizer.bypassSecurityTrustHtml(EXCLAMATION_INFO));

  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    if (this.changeDataFormService.getChangeData) {
      event.preventDefault();
    }
  }

  async ngOnInit() {
    this.delivery = await this.listService.getlist();
    const loading = await this.loading.create({
      message: 'Cargando...',
    });

    loading.present();

    try {
      this.getStates();
      this.deliveryAddressForm = this.formBuilder.group({
        namesAddress: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],],
        phone: ['', [Validators.required]],
        phoneTwo: [''],
        departmentAddress: ['', [Validators.required]],
        municipalityAddress: ['', [Validators.required]],
        addres_line_1: ['', [Validators.required, Validators.maxLength(155)]],
        zipCodeSelect: [null, [Validators.required]],
        zoneZipCodeId: [null, [Validators.required]],
        notes: [''],
      });

      await this.start();

      // Suscribe al evento de cambios en el formulario
      this.deliveryAddressForm.valueChanges.subscribe(() => {
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

  async start() {
    const addresses = (await this.resourceResource.getResource(Address).show(this.delivery.address.id)) // obtenemos los datos de address

    if (addresses) {
      this.address = addresses;

      this.deliveryAddressForm.patchValue({
        namesAddress: this.address.contactName,
        phone: this.address.contactPhone,
        phoneTwo: this.address.contact_phone_2,
        departmentAddress: this.address.state_id
          ? this.address.state_id.toString()
          : null,
        municipalityAddress: this.address.city_id
          ? this.address.city_id.toString()
          : null,
        addres_line_1: this.address.address_line_1,
        notes: this.address.notes,
      });

      if (this.address.state_id)
        this.getCitiesAddress(this.address.state_id).then((r) => {});

      if (this.address.city_id)
        await this.onCityChangeAddress(undefined, this.address.city_id, true);
    }

    this.formInitialState = this.deliveryAddressForm.value;
  }

  getZoneSelected() {
    let zoneSelected = null;
    if (this.zipCodeAdress?.zone.length > 0) {
      zoneSelected = this.zipCodeAdress.zone.filter(
        (item: any) =>
          item.id == this.deliveryAddressForm.get('zoneZipCodeId').value
      )[0];
    }

    return zoneSelected;
  }

  async onSubmit(customize?: boolean) {
    this.deliveryAddressForm.markAllAsTouched();
    if (!this.deliveryAddressForm.valid) {
      return false;
    }

    this.saving = true;
    // We retrieve the name of the selected zone and the zip code.
    const zoneSelected = this.getZoneSelected();
    this.address.zone = zoneSelected ? zoneSelected?.name : null;
    this.deliveryAddressForm
      .get('zipCodeSelect')
      .setValue(
        zoneSelected
          ? zoneSelected?.zip_code
          : this.deliveryAddressForm.get('zipCodeSelect').value
      );

    if (!this.deliveryAddressForm.get('zipCodeSelect').value) {
      this.snackBar.open(
        'No se pudo obtener un código postal válido. Por favor, verifica la información ingresada.',
        'Cerrar',
        {
          duration: 4500,
          panelClass: 'bg-danger',
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      return false;
    }

    const payload = {
      contact_name: this.deliveryAddressForm.get('namesAddress').value,
      contact_phone: this.deliveryAddressForm.get('phone').value,
      contact_phone_2: this.deliveryAddressForm.get('phoneTwo').value,
      state_id: this.deliveryAddressForm.get('departmentAddress').value,
      city_id: this.deliveryAddressForm.get('municipalityAddress').value,
      address_line_1: this.deliveryAddressForm.get('addres_line_1').value,
      zip_code: this.deliveryAddressForm.get('zipCodeSelect').value,
      zone: this.address.zone,
      notes: this.deliveryAddressForm.get('notes').value,
    };

    try {
      if (this.address.id) {
        await this.api
          .put('profile/addresses/' + this.address.id, payload)
          .toPromise();
      } else {
        await this.api.post('profile/addresses', payload);
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
        });

        this.formInitialState = this.deliveryAddressForm.value;
        this.changeDataFormService.resetChange();
      }
      await this.authService.getMeRefresh();
      this.saving = false;
      return true;
    } catch (exception) {
      this.snackBar.open(exception.error.message, null, {
        duration: 3000,
        panelClass: 'bg-danger',
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });

      this.saving = false;
      return false;
    }
  }

  async getStates() {
    this.states = await fetch(
      environment.paymentService +
        '/api/v1/states?page=1&per_page=22&filter[country_id]=1',
      {
        headers: {
          Authorization: 'Bearer ' + environment.bluemedicalPaymentToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res.data);
  }

  onStateChangeAddress(event: any) {
    this.deliveryAddressForm.get('zipCodeSelect').setValue(null);
    this.deliveryAddressForm.get('zoneZipCodeId').setValue(null);
    // obtenemos la ciudad con el id del estado seleccionado
    this.getCitiesAddress(event.target.value).then((r) => {});
  }

  async getCitiesAddress(state: string | number) {
    if (!state) {
      this.citiesAddress = [];
      return;
    }

    this.citiesAddress = await fetch(
      environment.paymentService +
        '/api/v1/cities?page=1&per_page=50&filter[state_id]=' +
        state,
      {
        headers: {
          Authorization: 'Bearer ' + environment.bluemedicalPaymentToken,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res.data);
  }

  async onZoneChangeAddress(event: Event) {
    this.redZonesData = { success: false, message: '', data: null }; // limpiamos las zonas rojas
    const zoneId = (event.target as HTMLSelectElement).value;
    const cityId = this.deliveryAddressForm.get('municipalityAddress').value;

    // We retrieve the ZIP code of the selected zone.
    const zoneSelected = this.getZoneSelected();
    if (zoneSelected) {
      await this.getRedZones(cityId, zoneSelected?.zip_code, zoneId, true);
    }
  }

  async onCityChangeAddress(event?: any, value?: string | number | null, flagGetRedZones: boolean = false, flagModalAlert: boolean = false) {
    this.redZonesData = { success: false, message: '', data: null };
    const city_id = event?.target?.value ?? value ?? null;
    this.deliveryAddressForm.get('zipCodeSelect').setValue(null);
    this.deliveryAddressForm.get('zoneZipCodeId').setValue(null);
    this.zipCodeAdress = await this.getZipcode(city_id); // obtenemos el zip code con el id de la ciudad seleccionada

    if (!this.zipCodeAdress) {
      this.deliveryAddressForm.patchValue({ zipCodeSelect: null });
      return;
    }

    if (this.zipCodeAdress.isList) {
      this.deliveryAddressForm.patchValue({ zipCodeSelect: this.address.zip_code });
      if (flagGetRedZones && this.address.zip_code)
        this.getRedZones(city_id, this.address.zip_code);
    } else {
      this.deliveryAddressForm.patchValue({ zipCodeSelect: this.zipCodeAdress.zip_code });
      this.getRedZones(city_id, this.zipCodeAdress.zip_code, null, flagModalAlert);
    }

    // If there are zones and we have a saved zone, we select it.
    if (this.zipCodeAdress.zone.length > 0 && this.address.zone) {
      const zoneZipCodeId = this.zipCodeAdress.zone.filter((item: any) => item.name == this.address.zone)[0];

      if (zoneZipCodeId) {
        this.deliveryAddressForm.patchValue({
          zoneZipCodeId: zoneZipCodeId.id,
        });
        this.getRedZones(city_id, zoneZipCodeId.zip_code, zoneZipCodeId.id);
      }
    }

    // We set up validations for the fields.
    if (this.zipCodeAdress?.zone.length < 1) {
      this.deliveryAddressForm
        .get('zipCodeSelect')
        .setValidators([Validators.required]);
      this.deliveryAddressForm.get('zoneZipCodeId').clearValidators();
    } else {
      this.deliveryAddressForm
        .get('zoneZipCodeId')
        .setValidators([Validators.required]);
      this.deliveryAddressForm.get('zipCodeSelect').clearValidators();
    }
    this.deliveryAddressForm.get('zipCodeSelect').updateValueAndValidity();
    this.deliveryAddressForm.get('zoneZipCodeId').updateValueAndValidity();

    !this.zipCodeAdress.isList
      ? this.deliveryAddressForm.get('zipCodeSelect').disable()
      : this.deliveryAddressForm.get('zipCodeSelect').enable();
  }

  async getZipcode(val: string | number) {
    try {
      if (!val) {
        return null;
      }

      let zipCodeResponse = await fetch(
        environment.paymentService + '/api/v1/cities/' + val + '/zip-codes',
        {
          headers: {
            Authorization: 'Bearer ' + environment.bluemedicalPaymentToken,
          },
        }
      )
        .then((res) => res.json())
        .then((res) => res.data);

      if (zipCodeResponse.zip_codes.length > 0) {
        let uniqueZipCode = {
          isList: false,
          zip_code: zipCodeResponse.zip_codes[0].id,
          zone: zipCodeResponse?.zones,
        };
        let listZipCode = {
          isList: true,
          zip_code: zipCodeResponse.zip_codes,
          zone: zipCodeResponse?.zones,
        };

        return zipCodeResponse.zip_codes.length > 1 ||
          zipCodeResponse.zones?.length > 0
          ? listZipCode
          : uniqueZipCode;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async onZipCodeChangeAddress (event: Event) {
    this.redZonesData = { success: false, message: '', data: null }; // limpiamos las zonas rojas
    const zip_code = (event.target as HTMLSelectElement).value;
    const cityId = this.deliveryAddressForm.get('municipalityAddress').value;

    await this.getRedZones(cityId, zip_code, null, true);
  }

  async getRedZones(city_id: number, zip_code: string | null = null, municipality_id: number | string | null = null, flagModalAlert: boolean = false) {
    try {
      // Construct the parameter object with only non-null values.
      const params: { city_id?: number; zip_code?: string; municipality_id?: number | string } = {};

      if (city_id !== null) {
        params.city_id = city_id;
      }
      if (zip_code !== null) {
        params.zip_code = zip_code;
      }
      if (municipality_id !== null) {
        params.municipality_id = municipality_id;
      }

      this.redZonesData = await this.api.get<RestrictedAddresses>('restricted-addresses', params).toPromise();
      if (flagModalAlert) {
        this.matDialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '450px',
          data: {
            title: 'Tu zona de entrega incluye áreas con restricciones en el servicio de envío',
            secondMessage: 'Es posible que se coordine un horario especial o punto de encuentro para la entrega',
            textButton: 'Entendido',
            typeMessage: 'warning'
          }
        });
      }
    } catch (exception) {
      this.redZonesData = { success: false, message: '', data: null };
    }
  }

  titleRedZonesWarning(): string {
    const cityName = this.citiesAddress.filter(city => city.id == this.deliveryAddressForm.get('municipalityAddress').value)[0]?.name || 'municipio';
    const zoneSelected = this.getZoneSelected();
    let title = `${cityName} tiene áreas con restricciones de entrega`;

    if (!this.zipCodeAdress.isList) {
      title = `${cityName} tiene áreas con restricciones de entrega`;
    }

    if (this.zipCodeAdress.isList) {
      const zipCodeName = this.zipCodeAdress.zip_code?.filter(value => value.id == this.deliveryAddressForm.get('zipCodeSelect').value)[0]?.label || 'código postal';
      title = `${zipCodeName} de ${cityName} tiene áreas con restricciones de entrega`;
    }

    if (this.zipCodeAdress?.zone.length > 0) {
      title = `${zoneSelected?.name} de ${cityName} tiene áreas con restricciones de entrega`;
    }

    return title;
  }

  hasChanged(): boolean {
    const currentValue = this.deliveryAddressForm.value;
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
    const control = this.deliveryAddressForm.get(controlName);
    for (const errorKey of Object.keys(this.validationMessages[controlName])) {
      if (control.hasError(errorKey)) {
        return this.validationMessages[controlName][errorKey];
      }
    }
    return '';
  }

  formatInputPhonePlaceHolder(phone: string, dialCode: string): string {
    const placeHolderPhone = new AsYouType().input(phone);

    // Quitamos del phone el dialCode y el símbolo "+" y lo regresamos a la vista
    const cleanedPhone = placeHolderPhone.replace(dialCode, '').replace('+', '').trim();
    // Reemplazamos cada dígito por 0
    const formattedPhone = cleanedPhone.replace(/\d/g, '0');
    return formattedPhone;
  }

  phoneBorderError(name: string) {
    let borderReturn = 'border-primary';
    if (this.deliveryAddressForm.get(name)?.hasError('required') && (this.deliveryAddressForm.get(name)?.dirty || this.deliveryAddressForm.get(name)?.touched)) {
      borderReturn = 'border-[#F44336]';
    }

    if (this.deliveryAddressForm.get(name)?.hasError('validatePhoneNumber') && (this.deliveryAddressForm.get(name)?.dirty || this.deliveryAddressForm.get(name)?.touched)) {
      borderReturn = 'border-[#F44336]';
    }

    return borderReturn;
  }

  validatingMaskingPhone(phoneValue: string, placeholder: string, event: any) {
    // si ya se cumplió en el valor el placeholder entonces evitamos que siga ingresando números y solo permitimos borrar
    if (phoneValue.length > placeholder.length && event.key !== 'Backspace') {
      this.deliveryAddressForm.patchValue({ phone: phoneValue.slice(0, -1) });
    }
  }

  validatingMaskingPhoneTwo(phoneValue: string, placeholder: string, event: any) {
    // si ya se cumplió en el valor el placeholder entonces evitamos que siga ingresando números y solo permitimos borrar
    if (phoneValue.length > placeholder.length && event.key !== 'Backspace') {
      this.deliveryAddressForm.patchValue({ phoneTwo: phoneValue.slice(0, -1) });
    }
  }

  capitalizeWordsInput(input: string) {
    const str = this.deliveryAddressForm.get(input).value;
    const strCapitalized = capitalizeWords(str);

    this.deliveryAddressForm.patchValue({ [input]: strCapitalized });
  }
}
