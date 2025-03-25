import { Component, Input, OnInit, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import moment, { Moment } from 'moment';
import { LoadingController, ModalController } from '@ionic/angular';
import { InsuranceAgent } from 'src/app/models/insurance-agents';
import { ApiService } from 'src/app/core/api/api.service';
import { Country } from 'src/app/models/country';

import { LayoutService } from 'src/app/@vex/services/layout.service';
import { UploadProfileComponent } from '../upload-profile/upload-profile.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageDialogComponent } from 'src/app/core/components/message-dialog/message-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/core/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AsYouType } from 'libphonenumber-js'
import { AuthService } from 'src/app/core/auth/auth.service';
import { ChangeDataFormService } from '../../services/components/change-data-form-service';
import { Subscription } from 'rxjs';
import {ListService} from "../../services/list/list.service";
import { Personal } from 'src/app/@vex/interfaces/personal-information.interface';
import { capitalizeWords } from 'src/app/@vex/utils/capitalize';

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;
const CHEVRON_UP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})

export class PersonalInformationComponent implements OnInit {
  @Input() showUploadImage: boolean = false;
  @Input() showSaveButton: boolean = false;
  @Input() showExpansionPanels: boolean = false;

  private saveChangesFormSubscription: Subscription; // esto nos ayudará a saber si estamos ya suscritos al evento de cambios en el formulario para no volver a suscribirnos

  capitalizeWords = capitalizeWords;
  saving: boolean;
  personalInformationForm: FormGroup;
  formInitialState: any;

  personal: Personal = {profile: {}} as any;
  countries: Country[];
  insuranceAgents: InsuranceAgent[];
  showVivoIdError: boolean = false;
  vivoIdErrorMessage: string = '';

  showPersonalInformation: boolean = true;
  showInsuranceInformation: boolean = true;

  months = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' },
  ];
  days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  rangeYears = [];

  validationMessages = {
    names: {
      required: 'El campo es requerido.',
      pattern: 'Solo se permiten letras.'
    },
    lastNames: {
      required: 'El campo es requerido.',
      pattern: 'Solo se permiten letras.'
    },
    documentNumber: {
      required: 'Número de Documento es requerido.',
      pattern: 'Número de documento debe ser de 13 dígitos.',
      maxlength: 'Número de Documento no puede tener más de 13 dígitos.'
    },
    documentType: {
      required: 'El campo es requerido.'
    },
    nationality: {
      required: 'El campo es requerido.'
    },
    gender: {
      required: 'El campo es requerido.'
    },
    country: {
      required: 'El campo es requerido.'
    },
    insuranceAgent: {
      required: 'El campo es requerido.'
    }
  };

  regexValidateInputText = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?: [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*\\s*$';

  deliveryInfo: any;

  constructor(
    private loading: LoadingController,
    private api: ApiService, private formBuilder: FormBuilder, public authService: AuthService,
    private resourceResource: ResourcesService, public changeDataFormService: ChangeDataFormService,
    public layoutService: LayoutService, private matSnackbar: MatSnackBar, private listService: ListService,
    private modalCtrl: ModalController, private matDialog: MatDialog, iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
    iconRegistry.addSvgIconLiteral('chevron-up', sanitizer.bypassSecurityTrustHtml(CHEVRON_UP));

    // rangeYears contendrá los años desde 1900 hasta el año actual
    for (let i = 1900; i <= new Date().getFullYear(); i++) {
      this.rangeYears.push(i);
    }
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
      this.getCountries();
      this.getInsuranceAgents();// Obtengo las aseguradoras
      this.getDeliveryInfo();

      this.personalInformationForm = this.formBuilder.group({
        names: ['', [Validators.required, Validators.pattern(this.regexValidateInputText)]],
        lastNames: ['', [Validators.required, Validators.pattern(this.regexValidateInputText)]],
        email: ['', [Validators.required, Validators.email]],
        firstPhone: [{ value: '', disabled: false, }, [Validators.required]],
        nationality: ['', Validators.required],
        gender: ['', Validators.required],
        documentType: ['', Validators.required],
        documentNumber: ['', Validators.required],
        country: ['', Validators.required],
        birthYear: [''],
        birthMonth: [''],
        birthDay: [''],
        insuranceAgent: [''],
        haveInsurance: [false],
        haveVivoLife: [false],
      });

      await this.start();

      // Suscribe al evento de cambios en el formulario
      this.personalInformationForm.valueChanges.subscribe(() => {
        this.hasChanged() ? this.changeDataFormService.markChangePending() : this.changeDataFormService.resetChange();
      });

      //Suscribirse al evento del servicio de cambio de datos para guardar los cambios
      this.saveChangesFormSubscription = this.changeDataFormService.getSaveChanges().subscribe(() => {
          this.onSubmit(true);
      });

      // Definir las validaciones dinámicas para el campo documentNumber
      this.personalInformationForm.get('documentType').valueChanges.subscribe((tipo) => {
        if (tipo === 'DPI') {
          // Si el tipo de documento es DPI, aplicar las validaciones. (máximo y mínimo 13 dígitos)
          this.personalInformationForm.get('documentNumber').setValidators([Validators.required, Validators.pattern('^[0-9]{13}$'), Validators.maxLength(13)]);
        } else {
          this.personalInformationForm.get('documentNumber').clearValidators(); // Si es otro tipo de documento, eliminar las validaciones
        }
        this.personalInformationForm.get('documentNumber').updateValueAndValidity(); // Actualizar el estado de las validaciones
      });

      // Definir las validaciones dinámicas para el campo insuranceAgent. (si haveInsurance es true, el campo es requerido)
      this.personalInformationForm.get('haveInsurance').valueChanges.subscribe((value) => {
        if (value) {
          this.personalInformationForm.get('insuranceAgent').setValidators(Validators.required);
        } else {
          this.personalInformationForm.get('insuranceAgent').clearValidators();
        }
        this.personalInformationForm.get('insuranceAgent').updateValueAndValidity();
      });

      loading.dismiss();

    } catch (error) {
      loading.dismiss()
    }
  }

  ngOnDestroy() {
    if (this.saveChangesFormSubscription) {
      this.saveChangesFormSubscription.unsubscribe(); // Desuscribirse del evento de guardar cambios en el formulario del servicio
    }
  }

  async start() {
    const personal = await this.api.get('profile', {}).toPromise<any>(); // obtenemos los datos de personal info

    if (personal.data) {
      this.personal.id = personal.data.id;
      this.personal.has_vivo_id = personal.data.has_vivo_id;
      this.personalInformationForm.patchValue({
        email: personal.data.email,
        haveVivoLife: personal.data.has_vivolife,
        haveInsurance: !!personal.data.insurance_agent_id
      });

      if (!personal.data.profile.hasOwnProperty('first_name')) { // si no tenemos perfil, establecemos valores por defecto
        // Establecemos nacionalidad y país de emisión de documento por defecto GT y día, mes y año de cumpleaños por defecto fecha de hoy
        this.personalInformationForm.patchValue({
          nationality: 'GT',
          country: 'GT',
          birthYear: moment().format('YYYY'),
          birthMonth: moment().format('MM'),
          birthDay: moment().format('DD'),
        });
      }

      if (personal.data.profile.hasOwnProperty('first_name')) {
        this.personal.profile.first_name = personal.data.profile.first_name;
        this.personal.profile.last_name = personal.data.profile.last_name;
        const birthDate = moment(personal.data.profile.birth_date, 'YYYY-MM-DD');
        this.personalInformationForm.patchValue({
          names: personal.data.profile.first_name,
          lastNames: personal.data.profile.last_name,
          firstPhone: this.formatPhoneNumber(personal.data.profile.emergency_phone),
          nationality: personal.data.profile.nationality,
          gender: personal.data.profile.sex,
          documentType: personal.data.profile.id_type,
          documentNumber: personal.data.profile.id_code,
          country: personal.data.profile.id_issue_country,
          insuranceAgent: personal.data.insurance_agent_id,
          birthYear: birthDate.format('YYYY'),
          birthMonth: birthDate.format('MM'),
          birthDay: birthDate.format('DD'),
        });

        // deshabilitamos el campo firstPhone
        this.personalInformationForm.get('firstPhone').disable();
      }

      if (personal.data.profile.length === 0 && !this.deliveryInfo?.wizard_done) {
        this.setProviderData();
      }
    }

    this.formInitialState = this.personalInformationForm.value;
  }

  async setProviderData() {
    try {
      const personalDataProvider = await this.authService.getPersonalDataByProvider();

      if (personalDataProvider?.success) {
        const data = personalDataProvider.data;
        if (data.names) {
          this.personalInformationForm.patchValue({
            names: data.names[0].givenName,
            lastNames: data.names[0].familyName,
          });
        }

        if (data.genders) {
          this.personalInformationForm.patchValue({
            gender: data.genders[0].value == 'male' ? 'Male' : 'Female',
          });
        }

        if (data.birthdays) {
          const date = data.birthdays[0].date;
          this.personalInformationForm.patchValue({
            birthYear: date.year,
            birthMonth: date.month < 10 ? '0' + date.month : date.month,
            birthDay: date.day,
          });
        }
      }
    } catch (e) {
      return;
    }
  }

  formatPhoneNumber(phone: string | any[]) {
    if (!phone) return phone;

    if (phone.length === 8) {
      return `+502${phone}`;
    }

    return phone;
  }

  async getCountries() {
    this.countries = (await this.resourceResource.getResource(Country).index({ paginate: false })).data;
  }

  async getInsuranceAgents() {
    this.insuranceAgents = (await this.resourceResource.getResource(InsuranceAgent).index({ paginate: false })).data;
  }

  async getDeliveryInfo() {
    this.deliveryInfo = await this.listService.getlist();
  }

  async onSubmit(customize?: boolean) {
    this.personalInformationForm.markAllAsTouched();
    if (!this.personalInformationForm.valid) {
      this.showPersonalInformation = true;
      this.showInsuranceInformation = true;

      return false;
    }

    this.saving = true;
    // damos formato a la fecha de nacimiento
    const birthDate = this.personalInformationForm.get('birthYear').value + '-' + this.personalInformationForm.get('birthMonth').value + '-' + this.personalInformationForm.get('birthDay').value;
    const haveInsurance = this.personalInformationForm.get('haveInsurance').value;

    // si no tenemos vivo_id haremos una petición post a profile para crear el perfil y si tenemos vivo_id haremos una petición put para actualizar el perfil
    const payload = {
      "first_name": this.personalInformationForm.get('names').value.trim(),
      "last_name": this.personalInformationForm.get('lastNames').value.trim(),
      "emergency_phone": this.personalInformationForm.get('firstPhone').value.toString(),
      "id_issue_country": this.personalInformationForm.get('country').value,
      "nationality": this.personalInformationForm.get('nationality').value,
      "birth_date": birthDate,
      "email": this.personalInformationForm.get('email').value,
      "id_type": this.personalInformationForm.get('documentType').value,
      "id_code": this.personalInformationForm.get('documentNumber').value,
      "sex": this.personalInformationForm.get('gender').value,
      "has_vivolife": this.personalInformationForm.get('haveVivoLife').value,
      "insurance_agent_id": haveInsurance ? this.personalInformationForm.get('insuranceAgent').value : null,
    };

    try {
      if (this.personal.has_vivo_id) {
        await this.api.put('profile/' + this.personal.id, payload).toPromise();
      } else {
        await this.api.post('profile', payload);
      }

      if (customize) {
        this.matDialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '450px',
          data: {
            title: '¡Tus datos han sido actualizados con éxito!',
            textButton: 'Aceptar',
            typeMessage: 'success'
          }
        }).afterClosed().subscribe(async () => {
          await this.start();
          await this.authService.getMeRefresh();

          this.changeDataFormService.resetChange();
          this.saving = false;
        });
      } else {
        await this.authService.getMeRefresh();
        this.saving = false;
      }

      return true;
    } catch (e) {
      this.matSnackbar.open(e.error.message, null, {
        duration: 3000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      if (e.error.errors?.hasOwnProperty('vivo_id')){
        // this.insertMessageValidation('documentNumber', e.error.data?.vivo_id[0]);
        this.vivoIdErrorMessage = e.error.errors?.vivo_id[0];
        this.showVivoIdError = true;
      }

      this.saving = false;
      return false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.personalInformationForm.get(controlName);
    for (const errorKey of Object.keys(this.validationMessages[controlName])) {
      if (control.hasError(errorKey)) {
        return this.validationMessages[controlName][errorKey];
      }
    }
    return '';
  }

  hasChanged(): boolean {
    const currentValue = this.personalInformationForm.value;
    for (const key in currentValue) {
      if (currentValue.hasOwnProperty(key)) {
        if (currentValue[key] !== this.formInitialState[key]) {
          return true;
        }
      }
    }
    return false;
  }

  // Agrega una propiedad para rastrear el estado del modal
  isModalOpen = false;

  async openUploadFileModal() {
    if (this.isModalOpen) {
      return;
    }

    this.isModalOpen = true;

    const modal = await this.modalCtrl.create({
      component: UploadProfileComponent,
      componentProps: {
        deliveryId: 1
      },
      cssClass: !this.layoutService.isMobile() ? "upload-file-modal" : 'upload-file-modal-mobile'
    });

    await modal.present();

    modal.onDidDismiss().then(async (data: any) => {
      this.isModalOpen = false;

      if (data.data == 'cancel' || data.data == undefined) {
        return;
      }

      await this.authService.getMeRefresh();

      return [];
    })
  }

  validateOnlyNumbersDPI(event) {
    this.showVivoIdError = false;
    this.vivoIdErrorMessage = '';

    // si el tipo de documento es DPI, solo se permiten números
    if (this.personalInformationForm.get('documentType').value === 'DPI') {
      // evitamos que el usuario ingrese letras y solo permitimos números
      if (!/^[0-9]+$/.test(event.target.value)) {
        event.target.value = event.target.value.slice(0, -1); // eliminamos la última letra ingresada
      }
    }
  }

  formatInputPhonePlaceHolder(phone: string, dialCode: string) {
    const placeHolderPhone = new AsYouType().input(phone)
    // quitamos del phone el dialCode y el símbolo "+" y lo regresamos a la vista
    return placeHolderPhone.replace(dialCode, '').replace('+', '').trim();
  }

  phoneBorderError() {
    let borderReturn = 'border-primary';
    if (this.personalInformationForm.get('firstPhone')?.hasError('required') && (this.personalInformationForm.get('firstPhone')?.dirty || this.personalInformationForm.get('firstPhone')?.touched)) {
      borderReturn = 'border-[#F44336]';
    }

    if (this.personalInformationForm.get('firstPhone')?.hasError('validatePhoneNumber') && (this.personalInformationForm.get('firstPhone')?.dirty || this.personalInformationForm.get('firstPhone')?.touched)) {
      borderReturn = 'border-[#F44336]';
    }

    return borderReturn;
  }

  validatingMaskingPhone(phoneValue: string, placeholder: string, event: any) {
    // si ya se cumplió en el valor el placeholder entonces evitamos que siga ingresando números y solo permitimos borrar
    if (phoneValue.length > placeholder.length && event.key !== 'Backspace') {
      this.personalInformationForm.patchValue({ firstPhone: phoneValue.slice(0, -1) });
    }
  }

  capitalizeWordsInput(input: string) {
    const str = this.personalInformationForm.get(input).value;
    const strCapitalized = capitalizeWords(str);

    this.personalInformationForm.patchValue({ [input]: strCapitalized });
  }

  changeInsuranceAgent(event: Event) {
    if (this.deliveryInfo?.order_collected_with_insurance) {
      this.matDialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: '450px',
        panelClass: 'custom-padding-class-dialog',
        data: {
          showTitle: false,
          message: 'Si haces este cambio deberás colocar nuevamente la fecha para tu próxima entrega.',
          question: '¿Estás seguro que deseas cambiar de aseguradora?',
          buttonText_1: 'Confirmar cambio',
          buttonText_2: 'Cancelar',
        }
      }).afterClosed().subscribe(async (result) => {
        if (result == false) {
          // guardamos el formulario
          await this.onSubmit(true);
        } else {
          this.personalInformationForm.patchValue({ insuranceAgent: this.formInitialState.insuranceAgent });
        }
      });
    }
  }

  onInsuranceQuestionChange(event: any) {
    if (event.value === false && this.deliveryInfo?.order_collected_with_insurance) {
      this.matDialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: '450px',
        panelClass: 'custom-padding-class-dialog',
        data: {
          showTitle: false,
          message: 'Si haces este cambio deberás colocar nuevamente la fecha para tu próxima entrega.',
          question: '¿Estás seguro que deseas eliminar tu seguro?',
          buttonText_1: 'Confirmar cambio',
          buttonText_2: 'Cancelar',
        }
      }).afterClosed().subscribe(async (result) => {
        if (result == false) {
          // guardamos el formulario
          await this.onSubmit(true);
          await this.getDeliveryInfo();
        } else {
          this.personalInformationForm.patchValue({ haveInsurance: true });
        }
      });
    }
  }
}
