import {Component, OnInit, ViewChild} from '@angular/core';
import {fadeInUp400ms} from 'src/app/@vex/animations/fade-in-up.animation';
import {ResourcesService} from 'src/app/core/data/resources/resources-service.service';
import {Options} from 'ngx-google-places-autocomplete/objects/options/options';
import {ListService} from '../services/list/list.service';
import {AuthService} from 'src/app/core/auth/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AlertController} from '@ionic/angular';
import {ApiService} from 'src/app/core/api/api.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {MessageDialogComponent} from 'src/app/core/components/message-dialog/message-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatIconRegistry} from '@angular/material/icon';
import moment from 'moment';
import { ModalController } from '@ionic/angular';
import {Semantics} from 'src/app/models/dosage-intervals';
import {Duration_Intervals, Each_Intervals} from 'src/app/models/durations-intervals';
import {FormBuilder} from '@angular/forms';
import {PersonalInformationComponent} from 'src/app/web/components/personal-information/personal-information.component';
import {DeliveryAddressComponent} from 'src/app/web/components/delivery-address/delivery-address.component';
import {BillingComponent} from '../components/billing/billing.component';
import { AccountVerificationComponent } from '../components/account-verification/account-verification.component';

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;
const CHEVRON_UP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;

export interface PaymentData {
  complies: boolean;
  complies_min_time: boolean;
  complies_bluemeds_service: boolean;
  advisor_number: [];
}

export interface Personal {
  id: number;
  name: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    id: number;
    id_type: string;
    sex: string;
    emergency_phone: string;
    nationality: string;
    id_code: string;
    id_issue_country: string;
    birth_date: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
  };
  has_vivolife: boolean;
  has_vivo_id: boolean;
  insurance_agent: string;
  insurance_agent_id: number;
  vivo_id: string;
  reference_code: string;
}

@Component({
  selector: 'app-wizard-register',
  templateUrl: './wizard-register.page.html',
  styleUrls: ['./wizard-register.page.scss'],
  animations: [
    fadeInUp400ms
  ]
})

export class WizardRegisterPage implements OnInit {
  @ViewChild(PersonalInformationComponent) personalInfoComponent: PersonalInformationComponent;
  @ViewChild(DeliveryAddressComponent) deliveryAddressComponent: DeliveryAddressComponent;
  @ViewChild(BillingComponent) billingComponent: BillingComponent;

  panelOpenState = false;
  reference_code: string = null;
  blockReferenceCode: boolean = false;
  paymentData: PaymentData = {} as any;
  step: number = 1;
  options: Options = {
    componentRestrictions: {
      country: "GT"
    }
  } as any;
  list: any;
  items: any[] = [];
  saving: boolean;
  showAdvisorInput: boolean = false;
  allowAdvisorInput: boolean = false;
  showTermsAndConditions: boolean = false;
  dosageSemantics = Semantics;
  itemsWarningByDate: any[] = [];
  itemsWarningDay: any[] = [];
  openWarningDateModal: boolean = false;
  showGeneralErrorMessage: boolean = false;
  wizardConfirmationError = false;
  inputAdvisorNumbers: any[] = [];

  directionList = [
    {text: 'Inicio', route: '/web/home'},
    {text: 'Lista de medicamentos', route: '/web/list/'},
    {text: 'Información personal', route: '/web/wizard-register?accion_actual=informacion-personal'},
  ];

  constructor(
    private resourceResource: ResourcesService,
    private listService: ListService,
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    iconRegistry: MatIconRegistry,
    private alertController: AlertController,
    private matDialog: MatDialog,
    private apiService: ApiService,
    public layoutService: LayoutService,
    private matSnackbar: MatSnackBar,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private modalCtrl: ModalController,
    private fb: FormBuilder) {
    this.paymentData.complies = true;
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
    iconRegistry.addSvgIconLiteral('chevron-up', sanitizer.bypassSecurityTrustHtml(CHEVRON_UP));

    this.inputAdvisorNumbers = [
      {
        id: 'advisorNumber1',
        type: 'number',
        value: '',
        maxLength: 10,
        size: 18,
      },
      {
        id: 'advisorNumber2',
        type: 'number',
        value: '',
        maxLength: 10,
        size: 18,
      },
      {
        id: 'advisorNumber3',
        type: 'number',
        value: '',
        maxLength: 10,
        size: 18,
      }
    ];
  }

  ngOnInit() {
    // imprimimos en consola el la url
    this.breadcrumbsWizard({route: this.router.url});

    this.start().then(r => {});
  }

  async start() {
    this.saving = true;
    if (!this.listService.list) {
      await this.listService.getlist();
    }

    this.list = this.listService.list.data;

    /* Obtenemos los medicamentos que están dentro de cada batch denro de list.batches vienen dos arreglos, un arreglo de batches asegurados y otro
    de batches no asegurados, los recorremos para guardar los meds */
    let typeBatche = [];
    if (this.list.batches.with_insurance.length > 0) {
      typeBatche = typeBatche.concat(this.list.batches.with_insurance);
    }

    if (this.list.batches.without_insurance.length > 0) {
      typeBatche = typeBatche.concat(this.list.batches.without_insurance);
    }

    if (typeBatche.length > 0) {
      typeBatche.forEach(batch => {
        batch.items.forEach((med: any) => {
          this.items.push(med);
        });
      });
    }

    if (this.items.length < 1) await this.router.navigate(['/web/list']);

    if (this.list.delivery_method == 'by_date') {
      // verificamos que los campos delivery_day y quantity no estén vacíos y si lo están regresamos a la lista.
      if (this.items.some(item => !item.delivery_day || !item.quantity)) {
        await this.router.navigate(['/web/list']);
      }
    }

    if (this.list.delivery_method == 'by_recipe') {
      // verificamos que los campos dose y frequency_id no estén vacíos y si lo están regresamos a la lista.
      if (this.items.some(item => !item.dose || !item.frequency_id)) {
        await this.router.navigate(['/web/list']);
      }
    }

    if (this.list.advisor_number !== null) {
      this.list.advisor_number.length > 0 ? this.allowAdvisorInput = false : this.allowAdvisorInput = true;
    } else {
      this.allowAdvisorInput = true;
    }

    this.saving = false;
  }

  validateAdvisorNumber() {
    // obtenemos todos los códigos de asesor y validamos que no se repita ninguno, la clase de cada input es validate-advisor-number
    let advisorNumbers = document.getElementsByClassName('validate-advisor-number');
    let advisorNumbersArray = [];

    if (advisorNumbers) {
      for (let i = 0; i < advisorNumbers.length; i++) {
        advisorNumbersArray.push({
          "code": advisorNumbers[i]['value'] ? (advisorNumbers[i]['value']).trim() : '-',
          "order": advisorNumbers[i]['id'].replace('advisorNumber', '')
        });
      }
    }

    // validamos que no se repita ningún code de advisorNumbersArray a no ser que sea un guión
    let repeated = advisorNumbersArray.filter((item, index) => advisorNumbersArray.findIndex(item2 => item.code === item2.code) != index && item.code != '-');
    if (repeated.length > 0) {
      this.matSnackbar.open('No puedes repetir códigos de asesor.', null, {
        duration: 4500,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }


    // validamos que los códigos de asesor solo contengan números o un guión
    let invalid = advisorNumbersArray.filter(item => !/^(\d+|-)$/.test(item.code));

    if (invalid.length > 0) {
      this.matSnackbar.open('El código de asesor solo puede contener números o un guión.', null, {
        duration: 4500,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // retornamos los códigos de asesor que no son vacíos
    return advisorNumbersArray;
  }

  async saveAndGoToStep(step: number) {
    this.saving = true;
    // antes de realizar la acción del paso correspondiente validaremos que los items cumplan con la validación de fecha y hora de corte
    if (this.list.delivery_method == 'by_recipe') {
      const itemsToValidateByDate = [];
      // recorremos todos los items para enviarlos al EP de validate-items-stock-date item.publication.portal_publication_id
      this.items.forEach((item: any) => {
        itemsToValidateByDate.push({
          id: item.id,
          name: item.publication.product.name,
          publication: {
            portal_publication_id: item.publication.portal_publication_id
          },
          dose: item.dose,
          frequency_id: item.frequency_id,
          stock_date: moment(item.stock_date).format("DD/MM/YYYY")
        });
      });

      try {
        await this.apiService.post('profile/validate-items-stock-date', {
          delivery_items: itemsToValidateByDate
        });
      } catch (exception) {
        this.itemsWarningByDate = [];
        /* dentro de exception.error.errors vienen los índices de los items que no cumplen con la validación así "delivery_items.0.stock_date", lo que haremos será recorrer todos los items a validar dentro de
        itemsToValidateDate y si el índice coincide con el índice que viene en e.error.errors agregaremos el item al array itemsWarningDate para mostrarlo en el modal */
        itemsToValidateByDate.forEach((item: any, index: number) => {
          if (exception.error.errors.hasOwnProperty('delivery_items.' + index + '.stock_date')) {
            this.itemsWarningByDate.push(item);
          }
        });

        // si hay items que no cumplen con la validación, mostramos el modal
        if (this.itemsWarningByDate.length > 0) {
          this.saving = false;
          this.openWarningDateModal = true;
          return;
        }
      }
    } else if (this.list.delivery_method == 'by_date') {
      let itemsToValidateDay = [];
      // recorremos todos los items para enviarlos al EP de validate-items-delivery_day item.publication.portal_publication_id
      this.items.forEach((item: any) => {
        itemsToValidateDay.push({
          id: item.id,
          name: item.publication.product.name,
          publication: {
            portal_publication_id: item.publication.portal_publication_id
          },
          delivery_day: item.delivery_day
        });
      });

      // si itemsWarningByDate tiene items que ya se validaron entonces los quitamos de itemsToValidateDay
      if (this.itemsWarningDay.length > 0) {
        itemsToValidateDay = itemsToValidateDay.filter(item => {
          let itemFound = this.itemsWarningDay.find(itemWarning => itemWarning.id == item.id);
          if (!itemFound)
            return item;
        });
      }

      // si itemsToValidateDay tiene items entonces los validamos
      if (itemsToValidateDay.length > 0) {
        this.itemsWarningByDate = await this.listService.validateItemsByDay(itemsToValidateDay)

        if (this.itemsWarningByDate.length > 0) {
          this.saving = false;
          this.itemsWarningDay = this.itemsWarningByDate;
          this.openWarningDateModal = true;
          return;
        }
      }
    }

    this.saving = true;
    switch (step - 1) {
      case 1:
        this.showGeneralErrorMessage = false;
        let personalInfoComponentResponse = await this.personalInfoComponent.onSubmit();

        if (!personalInfoComponentResponse) {
          this.showGeneralErrorMessage = true;
          break;
        }

        // agregamos a directionList el nuevo elemento
        this.directionList.push({text: 'Dirección de entrega y datos de contacto', route: '/web/wizard-register?accion_actual=direccion-de-entrega'});
        this.titleService.setTitle(`Bluemeds - Dirección de entrega y datos de contacto`);
        this.router.navigate([], { queryParams: { accion_actual: 'direccion-de-entrega'}, queryParamsHandling: 'merge' });
        this.step = step;

        break;
      case 2:
        this.showGeneralErrorMessage = false;
        let deliveryAddressComponentResponse = await this.deliveryAddressComponent.onSubmit();

        if (!deliveryAddressComponentResponse) {
          this.showGeneralErrorMessage = true;
          break;
        }

        // agregamos a directionList el nuevo elemento
        this.directionList.push({text: 'Datos de facturación y método de pago', route: '/web/wizard-register?accion_actual=metodo-de-pago'});
        this.titleService.setTitle(`Bluemeds - Datos de facturacion y método de pago`);
        this.router.navigate([], { queryParams: { accion_actual: 'metodo-de-pago'}, queryParamsHandling: 'merge' });
        this.step = step;
        break;
      case 3:
        this.wizardConfirmationError = false;
        let validateAdvisorNumberData = this.validateAdvisorNumber();

        if (validateAdvisorNumberData === false) {
          this.saving = false;
          return false;
        }

        this.showGeneralErrorMessage = false;
        try {
          // Check if the user has complied with T&C
          if (!this.paymentData.complies) {
            const alert = await this.alertController.create({
              header: "Por favor aceptar",
              message: "Términos y Condiciones",
              buttons: [
                {
                  text: "Aceptar"
                },
              ]
            });
            alert.present();
            this.saving = false;
            return false;
          }
          // check if the user has complied with the minimum time
          if (!this.paymentData.complies_min_time) {
            const alert = await this.alertController.create({
              header: "Por favor aceptar",
              message: "Período mínimo de suscripción",
              buttons: [
                {
                  text: "Aceptar"
                },
              ]
            });
            alert.present();
            this.saving = false;
            return false;
          }
          // check if the user has complied with the Bluemeds service
          if (!this.paymentData.complies_bluemeds_service) {
            const alert = await this.alertController.create({
              header: "Por favor aceptar",
              message: "Servicio de Bluemeds",
              buttons: [
                {
                  text: "Aceptar"
                },
              ]
            });
            alert.present();
            this.saving = false;
            return false;
          }

          this.showGeneralErrorMessage = false;
          let billingComponentResponse = await this.billingComponent.onSubmit();

          if (!billingComponentResponse) {
            this.showGeneralErrorMessage = true;
            this.wizardConfirmationError = true;
            break;
          }

          if (this.allowAdvisorInput && validateAdvisorNumberData) {
            this.list = await this.listService.getlist();
            this.list.advisor_number = validateAdvisorNumberData;

            this.listService.list.data = this.list;
            await this.listService.update();
          }

          this.apiService.get('subscriptions-success/' + this.list.id).toPromise().then(() => {
            this.authService.getMeRefresh();
            this.router.navigate(['/web/subscriptions-success']);
            this.titleService.setTitle(`Bluemeds - Suscripción exitosa`);
          }).catch();
        } catch (e) {
          let msg = null;
          if (e.status == 422) {
            msg = e.error?.message ?? "El formulario tiene errores";
          }
          else if (e.data) {
            msg = e.message ?? "El formulario tiene errores";
          }
          else {
            this.router.navigate(['/web/subscriptions-failure']);
          }

          if(msg)
          {
            this.matSnackbar.open(msg, null, {
              duration: 3000,
              panelClass: "bg-danger",
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }

          step = step - 1;
          this.step = step;
        }
        break;
    }
    this.saving = false;
    // this.step = step;
  }

  checkCAB(event) {
    event.target.value = event?.target?.value.replace(/[^\d]*/g, '');
  }

  async applyReferralCode() {
    // consumimos EP para validar codigo de referido
    try {
      if (this.reference_code != null && this.reference_code != '') {
        this.reference_code = this.reference_code.trim();
        const res = await this.apiService.post('referral/'+ this.list.id, { reference_code: this.reference_code });

        if (res.success) {
          this.matDialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: {
              title: res.modal_messages.title ?? '¡Has ingresado correctamente tu código o cupón!',
              secondMessage: res.modal_messages.description ?? 'Obtendrás beneficios.',
              textButton: 'Aceptar',
              showSuccess: true,
              typeMessage: 'success'
            }
          })
          // bloqueamos el campo para que no se pueda editar
          this.blockReferenceCode = true;
        }
      } else {
        this.matSnackbar.open('Para aplicar un código, el campo no puede ir vacío.', null, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    } catch (error) {
      let showWarning = !!error.error?.warning;
      this.matDialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: {
          message: error.error.modal_messages && error.error.modal_messages.description
                    ? error.error.modal_messages.description
                    : error.error.message
                    ? error.error.message
          : 'Ha ocurrido un error al aplicar el código de referido.',
          title: error.error.modal_messages && error.error.modal_messages.title
                  ? error.error.modal_messages.title
                  : 'Ha ocurrido un error',
          textButton: 'Entendido',
          typeMessage: showWarning ? 'warning' : 'error',
        }
      })
    }
  }

  breadcrumbsWizard(item: any) {
    // obtenemos del item el query param accion_actual
    const accion_actual = item.route?.split('?')[1]?.split('=')[1];

    switch (accion_actual) {
      case 'informacion-personal':
        this.step = 1;
        // quitamos del array directionList los últimos dos elemetos (direccion-de-entrega y metodo-de-pago), pero es posible que aún no se llegue al tercer paso (metodo-de-pago), si es ese el caso quitaremos solo el último elemento
        if (this.directionList.length > 4) this.directionList.splice(this.directionList.length - 2, 2);
        else if (this.directionList.length == 4) this.directionList.splice(this.directionList.length - 1, 1);

        this.titleService.setTitle(`Bluemeds - Información personal`);
        this.router.navigate([], { queryParams: { accion_actual: 'informacion-personal'}, queryParamsHandling: 'merge' }).then(r => {});
        break;
      case 'direccion-de-entrega':
        this.step = 2;
        if (this.directionList.length > 4) this.directionList.splice(this.directionList.length - 1, 1);
        this.titleService.setTitle(`Bluemeds - Dirección de entrega y datos de contacto`);
        this.router.navigate([], { queryParams: { accion_actual: 'direccion-de-entrega'}, queryParamsHandling: 'merge' }).then(r => {});
        break;
      case 'metodo-de-pago':
        this.step = 3;
        this.titleService.setTitle(`Bluemeds - Datos de facturacion y método de pago`);
        this.router.navigate([], { queryParams: { accion_actual: 'metodo-de-pago'}, queryParamsHandling: 'merge' }).then(r => {});
        break;
      default:
        // si no es ninguno de los 3 paso vamos o a lista de medicamentos o a inicio
        if (!accion_actual) {
          this.titleService.setTitle(`Bluemeds`);
          this.router.navigate([item.route]).then(r => {});
        } else {
          this.titleService.setTitle(`Bluemeds - Información personal`);
          this.router.navigate([], { queryParams: { accion_actual: 'informacion-personal'}, queryParamsHandling: 'merge' }).then(r => {});
        }
        break;
    }
  }

  breadcrumbsWizardIcon(item: any) {
    // obtenemos del item el query param accion_actual
    switch (item) {
      case 1:
        this.step = 1;
        if (this.directionList.length > 4) this.directionList.splice(this.directionList.length - 2, 2);
        else if (this.directionList.length == 4) this.directionList.splice(this.directionList.length - 1, 1);

        this.titleService.setTitle(`Bluemeds - Información personal`);
        this.router.navigate([], { queryParams: { accion_actual: 'informacion-personal'}, queryParamsHandling: 'merge' }).then(r => {});
        break;
      case 2:
        if (this.authService.me.wizard_profile) {
          this.step = 2;
          if (this.directionList.length > 4) this.directionList.splice(this.directionList.length - 1, 1);
          this.titleService.setTitle(`Bluemeds - Dirección de entrega y datos de contacto`);
          this.router.navigate([], { queryParams: { accion_actual: 'direccion-de-entrega'}, queryParamsHandling: 'merge' }).then(r => {});
        }
       break;
      case 3:
        if(this.authService.me.wizard_address) {
          this.step = 3;
          this.titleService.setTitle(`Bluemeds - Datos de facturacion y método de pago`);
          this.router.navigate([], { queryParams: { accion_actual: 'metodo-de-pago'}, queryParamsHandling: 'merge' }).then(r => {});
        }
        break;
      default:
    }
  }

  get meInfo() { return this.authService.meInfo};

  async openAccountVerificationModal() {
    const modal = await this.modalCtrl.create({
      component: AccountVerificationComponent,
      componentProps: {
        deliveryId: this.list.id,
      },
      cssClass: !this.layoutService.isMobile() ? "account-verification-modal" : 'account-verification-mobile'
    });
    modal.present();

    modal.onDidDismiss().then(async (data: any) => {
      if (data.data == 'cancel' || data.data == undefined) {
        return;
      }
      
      setTimeout(() => {
        this.meInfo.email_verified_at = true;
      });

      this.matSnackbar.open('Cuenta verificada correctamente', null, {
        duration: 4000,
        panelClass: "bg-success",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    })
  }


  clearInput(item: any) {
    item.value = '';
  }

  openWindowsWhatsApp() {
    window.open('https://api.whatsapp.com/send/?phone=50224272000&text&type=phone_number&app_absent=0', '_blank');
  }

  protected readonly Number = Number;

  getDurationItem(each: number, duration: string) {
    const intervals = Duration_Intervals[each];
    const interval = intervals.find((i: { value: any; }) => i.value === Number(duration));

    if (interval) {
      return interval.name;
    }
  }

  getEachName(valueReceived: number): string {
    const value = Number(valueReceived);
    const each = Each_Intervals?.find(each => each.value === value)

    let eachName = ''
    if (each) {
      eachName = each.name.toString()
    }

    return eachName;
  }

  async updateDeliveryDate() {
    if (this.list.delivery_method == 'by_recipe') {
      // acutualiizamos la fecha de entrega de la delivery a la de mañana de los items dentro de itemsWarningDate y llamamos calculateDataItem para actualizar los datos de los items
      for (const item of this.itemsWarningByDate) {
        item.stock_date = moment().add(1, 'days').format("YYYY-MM-DD");

        let itemToSend = {};
        itemToSend = {
          "portal_publication_id": item.publication.portal_publication_id,
          "delivery_method": 'by_recipe',
          "dose": item.dose,
          "frequency_id": item.frequency_id ? Number(item.frequency_id) : item.frequency_id,
          "stock_date": moment(item.stock_date).format("DD/MM/YYYY")
        }

        try {
          // consumimos EP de update item
          await this.apiService.patch('profile/deliveries/' + this.list.id + '/item/' + item.id, itemToSend).toPromise<any>();

        } catch (e) {
          this.matSnackbar.open(e.error.message, null, {
            duration: 4000,
            panelClass: "bg-danger",
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }

        // si ya pasamos por todos los items actualizamos la lista y pasamos al siguiente paso
        if (this.itemsWarningByDate.indexOf(item) === this.itemsWarningByDate.length - 1) {
          this.list = await this.listService.getlist()

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

          this.openWarningDateModal = false;
          await this.saveAndGoToStep(this.step + 1);
        }
      }
    } else {
      this.openWarningDateModal = false;
      await this.saveAndGoToStep(this.step + 1);
    }
  }
}
