import {Component, HostListener, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import moment from 'moment';
import {PublicationModalComponent} from '../components/publication-modal/publication-modal.component';
import {UploadFileComponent} from '../components/upload-file/upload-file.component';
import {ListService} from '../services/list/list.service';
import icEdit from '@iconify/icons-ic/round-edit-note';
import icRoundClose from '@iconify/icons-ic/round-close';
import {Intervals, Semantics} from 'src/app/models/dosage-intervals';
import {Duration_Intervals, Each_Intervals} from 'src/app/models/durations-intervals';
import {Frequency} from 'src/app/models/frequency';
import {ResourcesService} from 'src/app/core/data/resources/resources-service.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import {BudgetService} from '../services/budget/budget.service';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {AuthService} from 'src/app/core/auth/auth.service';
import {MatIconRegistry} from '@angular/material/icon';
import {ApiService} from "../../core/api/api.service";
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from "../../core/components/confirmation-dialog/confirmation-dialog.component";


const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;
const CHEVRON_UP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;
const EXCLAMATION_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.713T12 7q-.425 0-.713.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/></svg>`;
const BANNER_STORAGE_KEY = 'bannerClosedRefererCode';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  static lastList: any;
  icEdit = icEdit;
  icClose = icRoundClose
  dosageIntervals = Intervals;
  dosageSemantics = Semantics;
  frequencies: Frequency[];
  durationIntervals = Duration_Intervals;
  eachIntervals = Each_Intervals;
  items: any[] = [];
  itemsWarningDate: any[] = [];
  itemsWarningDay: any[] = [];
  batches: any[] = [];

  list: any;
  minStockDate = new Date();
  maxStockDate: Date;

  panelOpenState = false;
  panelOpenStateDocuments = false;
  selectDeliveryMethod: string = null;
  daysToSelect = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  documentsFiles: any[] = [];
  timerId = null;
  showGeneralErrorMessage = false;
  openWarningModal = false;
  openWarningDateModal = false;
  openWarningDayModal = false;
  flagWarningDayModal = false; // Esta variable nos ayudará a saber si el modal se está mostrando por modificar los inputs o por ir al wizard, y saber que acción tomar (si ir al wizard o solo cerrar el modal)
  messageWarningModal = '';
  auxItemToSend = null;
  loadSpiner = false;
  fistTime: number = 1;
  elementSize: number;
  reference_code_save: string;
  welcomeMenu = [{
    step: '1',
    label: 'Agrega medicamentos \na tu lista',
    icon: 'add-circle-outline',
    buttonLabel: 'Buscar medicamentos',
    route : '/web/search'
  },
  {
    step: '2',
    label: 'Agrega fechas de \nentrega',
    icon: 'calendar-outline',
    buttonLabel: 'Configurar fechas',
    route : '/web/list'
  },
  {
    step: '3',
    label: 'Ingresa tus datos personales \n y verifica tu cuenta',
    icon: 'person-outline',
    buttonLabel: 'Registra tus datos',
    route : '/web/list'
  }];
  showBanner: boolean = true;

  constructor(
    private matDialog: MatDialog,
    private listService: ListService,
    private apiService: ApiService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private matSnackbar: MatSnackBar,
    private resourceService: ResourcesService,
    public layoutService: LayoutService,
    private budgetService: BudgetService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    iconRegistry: MatIconRegistry,
    private titleService: Title,
    private router: Router) {
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
    iconRegistry.addSvgIconLiteral('chevron-up', sanitizer.bypassSecurityTrustHtml(CHEVRON_UP));
    iconRegistry.addSvgIconLiteral('exclamation-info', sanitizer.bypassSecurityTrustHtml(EXCLAMATION_INFO));

    this.maxStockDate = new Date();
    this.maxStockDate.setDate(this.maxStockDate.getDate() + 90);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    if (this.hasEmptyFields()) {
      event.preventDefault();
      event.returnValue = '¿Estás seguro de que quieres cerrar la ventana? Aún hay campos vacíos.';
    }
  }

  ngOnInit() {
    this.start();
    this.getFrequencies(); // obtenemos las frecuencias
    this.titleService.setTitle(`Bluemeds`);
    this.fistTime = 0;
    this.calculateElementSize();
    this.checkCodeBannerVisibility(); // verificamos si poodemos mostrar el banner
  }

  get meInfo() { return this.authService.meInfo};

  async start() {
    // obtenemos de la URL el parametro new si este existe y es igual a true entonces mostramos texto de fecilicitaciones
    const urlParams = new URLSearchParams(window.location.search);

    const loading = await this.loadingCtrl.create({
      message: 'Obteniendo datos de la suscripción...',
    });
    loading.present();

    try {
      await this.authService.validateReferenceCode();
      // No referral advertising will be used for the time being.
      this.reference_code_save = this.authService.token.reference_code;

      this.list = await this.listService.getlist();
      ListPage.lastList = this.list;
      // obtenemos el metodo de entrega
      this.selectDeliveryMethod = this.list?.delivery_method;

      let budget = await this.budgetService.getItemsFromStorage();

      // Si tengo items en el cotizador los paso y lo borro, y recargo la lista
      if (budget.length > 0 && (this.list.batches.with_insurance.length === 0 && this.list.batches.without_insurance.length === 0)) {
        await this.listService.addBudgetToList(this.list.id)
          .then(
            () => {
              this.budgetService.deleteBudget();
            }
          );
      }

      this.getTotalList();

      if (moment().format('HH:mm') > '14:00') {
        this.minStockDate = moment().add(1, 'days').toDate();
      }

      // obtenemos el query param insurer_doc para saber si se debe desplazar hacía el panel de documentos
      const insurer_doc = urlParams.get('insurer_doc');

      if (insurer_doc == 'true') {
        this.goToInsurerSection();
      }

      // obtenemos los archivos del delivery
      this.documentsFiles = await this.apiService.get('profile/deliveries/' + this.list.id + '/insurance-attachments').toPromise().then((response: any) => {
        return response.data;
      }).catch((error) => {
        return [];
      });

      loading.dismiss();
    } catch(e) {
      loading.dismiss();
    }
  }

  async getTotalList() {
    this.list = await this.listService.getlist();
    ListPage.lastList = this.list;

    let withInsurance = null;
    let withoutInsurance = null;

    /* Dentro de list.batches vienen dos array, with_insurance y without_insurance, estos poseen los batches que poseen los items, los recorrememos para
    relaizar los cálculos */
    if (this.list.batches.with_insurance.length > 0) {
      withInsurance = {
        id: 'with_insurance',
        batches: this.calculateDateItemsByBatch(this.list.batches.with_insurance)
      };
    }

    if (this.list.batches.without_insurance.length > 0) {
      withoutInsurance = {
        id: 'without_insurance',
        batches: this.calculateDateItemsByBatch(this.list.batches.without_insurance)
      };
    }

    this.batches = [withInsurance, withoutInsurance];

    this.list.delivery_date_input = moment(this.list.delivery_date, "YYYY-MM-DD").utc(false).toDate();
  }

  calculateDateItemsByBatch(batches: any): any[] {
    this.items = [];
    const retBatch = batches.map((batch: { items: any[]; sumSavings: string; sumTotal: string; }) => {
      let sumSaving = 0;
      let sumTotal = 0;

      batch.items = batch.items.map((element) => {
        element.stock_date = element.stock_date ? moment(element.stock_date, "YYYY-MM-DD").utc(false).toDate() : null

        // validamos las dosis para crar dosis auxiliares que nos ayudaran a mostrar los valores en el select si se selecciona alguna dosis que no corresponda a las dosis de la lista
        const index = this.dosageIntervals[element.publication.product.presentation?.trim()]?.findIndex((item: any) => item.value == element.dose);
        if (index != -1) {
          element.auxDosage = element.dose
          element.showOther = false
        } else {
          element.auxDosage = element.dose
          if (element.dose != 0 && element.dose != null) {
            element.otherDosageValue = element.dose
            element.showOther = true
          }
        }

        // si la propiedad duration vienen como null entonces le asignamos el valor por defecto de "indefinido"
        if (element.duration == null || element.duration == 'indefinido' || element.duration == 'undefined') {
          element.duration = 'undefined';
        }

        if (element.insurance_auth) { element.covered_by_insurance = true; } // si tenemos insurance_auth entonces marcamos creamos una variable para marcar el checkbox de cobertura

        if (element.more_info && element.more_info.monthly_total_savings) { // contamos el total de ahorro
          sumSaving += parseFloat(element.more_info.monthly_total_savings.replace(',', ''));
        }

        if (element.more_info && element.more_info.portal_monthly_price) { // contamos el total de la lista
          sumTotal += parseFloat(element.more_info.portal_monthly_price.replace(',', ''));
        }

        this.items.push(element);
        return element;
      });

      batch.sumSavings = sumSaving.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      batch.sumTotal = sumTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return batch;
    });

    return retBatch;
  }

  onChangeDeliveryMethodRadioButton() {
    if (this.selectDeliveryMethod == 'by_recipe' && (this.list.delivery_method != this.selectDeliveryMethod)) {
      this.changeDeliveryDate();
    }

    if (this.selectDeliveryMethod == 'by_date' && (this.list.delivery_method != this.selectDeliveryMethod)) {
      this.changeDeliveryDay();
    }
  }

  async changeDeliveryDate() {
    if (this.list.delivery_method != this.selectDeliveryMethod) {
      this.matDialog.open(ConfirmationDialogComponent, {
        width: '500px',
        panelClass: 'custom-padding-class-dialog',
        data: {
          message: 'Estás por modificar tu método de entrega de medicamentos. La información anterior no será guardada.',
          question: '¿Deseas continuar?',
          buttonText_1: 'Cancelar',
          buttonText_2: 'Continuar',
          showTitle: false,
        }
      }).afterClosed().subscribe(async (result) => {
        if (result) {
          this.changeDeliveryMethod('by_recipe');
        } else {
          // regresamos el valor del radio button al valor anterior
          this.selectDeliveryMethod = this.list.delivery_method;
        }
      });
    } else {
      this.changeDeliveryMethod('by_recipe');
    }
  }

  async changeDeliveryDay() {
    if (this.list.delivery_method != this.selectDeliveryMethod) {
      await this.matDialog.open(ConfirmationDialogComponent, {
        width: '500px',
        panelClass: 'custom-padding-class-dialog',
        data: {
          message: 'Estás por modificar tu método de entrega de medicamentos. La información anterior no será guardada.',
          question: '¿Deseas continuar?',
          buttonText_1: 'Cancelar',
          buttonText_2: 'Continuar',
          showTitle: false,
        }
      }).afterClosed().subscribe(async (result) => {
        if (result) {
          this.changeDeliveryMethod('by_date');
        } else {
          // regresamos el valor del radio button al valor anterior
          this.selectDeliveryMethod = this.list.delivery_method;
        }
      });
    } else {
      this.changeDeliveryMethod('by_date');
    }
  }

  async changeDeliveryMethod(deliveryToChange: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando'
    });
    loading.present();

    if (deliveryToChange == 'by_date') {
      await this.apiService.post('profile/deliveries/' + this.list.id + '/change-delivery-method', {
        delivery_method: this.selectDeliveryMethod
      });
    }
    else {
      await this.apiService.post('profile/deliveries/' + this.list.id + '/change-delivery-method', {
        delivery_method: this.selectDeliveryMethod
      });
    }

    if (this.selectDeliveryMethod != this.list.delivery_method) {
      const alert = await this.alertController.create({
        header: 'Método de entrega',
        message: 'Hemos actualizado el método de entrega de tu lista.',
        backdropDismiss: false,
        buttons: [
          {
            text: "Entendido",
            role: "cancel"
          }
        ]
      })
      alert.present();
    }

    loading.dismiss();
    this.start();
  }

  openPublicationModalFunction(i) {
    this.openPublicationModal(i);
  }

  async openPublicationModal(deliveryItem: any) {
    const modal = await this.modalCtrl.create({
      component: PublicationModalComponent,
      componentProps: {
        publication: deliveryItem.publication,
        deliveryItem: deliveryItem,
        delivery_method: this.list.delivery_method,
        delivery_id: this.list.id,
      },
      cssClass: !this.layoutService.isMobile() ? "publication-modal" : 'publication-modal-mobile'
    });
    modal.present();

    modal.onDidDismiss().then(async (res) => {
      if (!res.data) {
        return;
      }

      if (res?.data?.deleted) {
        this.start();
        return;
      }

      if (this.list.delivery_method == 'by_recipe') {
        if (res && res?.data) {
          if (res.data.information.data.hasOwnProperty('show_modal') && res.data.information.data.show_modal) {
            this.openWarningModal = true;
            this.messageWarningModal = res.data.information.message;
            this.auxItemToSend = {
              id: res.data.deliveryItem.id,
              data: res.data.deliveryItem
            }
          }
        }
      }

      if (this.list.delivery_method == 'by_date') {
        if (res && res?.data) {
          if (data?.itemValidate.length > 0) {
            this.itemsWarningDay = [];
            if (data?.itemValidate[0].id) {
              // antes de calcular los datos, validamos el día que se está seleccionando
              let itemsToValidateDay = [];
              itemsToValidateDay.push(data.itemValidate[0]);

              this.itemsWarningDay = await this.listService.validateItemsByDay(itemsToValidateDay)

              if (this.itemsWarningDay.length > 0) {
                this.openWarningDayModal = true;
              }
            }
          }
        }
      }

      this.start();
    })

    const { data, role } = await modal.onWillDismiss();
    // this.batches = (await this.listService.getlist()).batches
  }

  formatDate(date) {
    return moment(date, "YYYY-MM-DD").format("DD/MM/YYYY");
  }

  async copyToClipBoard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // mostramos mensaje de copiado
      this.matSnackbar.open("Código copiado al portapapeles", null, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } catch (err) {
      //
    }
  }

  async getFrequencies() {
    this.frequencies = (await this.resourceService.getResource(Frequency).index({ paginate: false })).data;
  }

  async openUploadFileModal() {
    const modal = await this.modalCtrl.create({
      component: UploadFileComponent,
      componentProps: {
        deliveryId: this.list.id
      },
      cssClass: !this.layoutService.isMobile() ? "upload-file-modal" : 'upload-file-modal-mobile'
    });
    modal.present();

    modal.onDidDismiss().then(async (data: any) => {
      if (data.data == 'cancel' || data.data == undefined) {
        return;
      }

      this.matSnackbar.open("Archivos cargados con éxito", null, {
        duration: 3500,
        panelClass: ["bg-success", "text-white", "flex", "justify-center"],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      // obtenemos los archivos de la delivery para mostrarlos excepto el que eliminamos
      this.documentsFiles = await this.apiService.get('profile/deliveries/' + this.list.id + '/insurance-attachments').toPromise().then((response: any) => {
        return response.data;
      }).catch((error) => {
        return [];
      });
    })
  }

  async changeDosage(item: any) {
    // si la dosis no se encuentra en la lista de dosis, mostramos el input de otra dosis
    const index = this.dosageIntervals[item.publication.product.presentation?.trim()]?.findIndex((element: any) => element.value == item.dose);
    // no se encontro dosis en la lista de dosis
    if (index == -1) {
      // mostramos modal para ingresar dosis personalizada
      const alert = await this.alertController.create({
        header: 'Dosis personalizada (' +  item.publication.product.presentation + ')',
        inputs: [
          {
            name: 'otraDosis',
            type: 'number',
            placeholder: 'Ingresa tu dosis'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              item.dose = item?.auxDosage;
            }
          },
          {
            text: 'Aceptar',
            handler: async (data: any) => {
              await this.validateDosage(item, data);
            }
          }
        ]
      });
      await alert.present();
    } else {
      let itemToValidate = {
        "id": item.id,
        "portal_publication_id": item.publication.portal_publication_id,
        "dose": item.dose,
        "frequency_id": item.frequency_id,
        "frequency": null,
        "publication": null,
        "stock_date": item.stock_date,
      };

      try {
        const response = await this.budgetService.validateItem(itemToValidate);

        if (response.success) {
          item.showOther = false;
          this.calculateDataItem(item, this.selectDeliveryMethod);
        }
      } catch (error) {
        let msg = 'Ocurrió un error el producto a su lista';
        if (error.status == 422) {
          msg = error.error?.message ?? "El formulario tiene errores";
        }

        this.matSnackbar.open(msg, null, {
          duration: 6000,
          panelClass: "bg-danger",
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        item.dosage = item?.auxDosage;
      }
    }
  }

  async validateDosage(item: any, data: any) {
    // validamos que la dosificación que se está ingresando es válida antes de guardarla
    let itemToValidate = {
      "id": item.id,
      "portal_publication_id": item.publication.portal_publication_id,
      "dose": data.otraDosis,
      "frequency_id": item.frequency_id,
      "frequency": null,
      "publication": null,
      "stock_date": item.stock_date,
    };

    try {
      const res = await this.budgetService.validateItem(itemToValidate);

      if (res.success) {
        item.dose = Number(data.otraDosis);
        item.otherDosageValue = Number(data.otraDosis);
        item.showOther = true;
        this.calculateDataItem(item, this.selectDeliveryMethod);
      }
    } catch (e) {
      let msg = 'Ocurrió un error el producto a su lista';
      if (e.status == 422) {
        msg = e.error?.message ?? "El formulario tiene errores";
      }

      this.matSnackbar.open(msg, null, {
        duration: 6000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      item.dose = item?.auxDosage;
    }
  }

  async calculateDataItem(item: any, delivery_method: string) {
    try {
      // construimos el objeto a enviar en el ep de update Item
      let itemToSend = {};
      if (delivery_method == 'by_recipe') {
        itemToSend = {
          "portal_publication_id": item.publication.portal_publication_id,
          "delivery_method": delivery_method,
          "dose": item.dose,
          "frequency_id": item.frequency_id ? Number(item.frequency_id) : item.frequency_id,
          "stock_date": moment(item.stock_date).format("DD/MM/YYYY")
        }
      } else {
        let dates = await this.apiService.get('profile/deliveries/'+ this.list.id + '/item/' + item.id + '/options-from?delivery_day=' + item.delivery_day + '&each=' + item.each + '&first_time=' + this.fistTime).toPromise<any>();
        let defaultDate = dates.options[0];
        itemToSend = {
          "portal_publication_id": item.publication.portal_publication_id,
          "delivery_method": delivery_method,
          "quantity": item.quantity,
          "each": item.each,
          "duration": item.duration,
          "delivery_day": item.delivery_day,
          "covered_by_insurance": item.covered_by_insurance,
          "insurance_auth_number": item?.insurance_auth?.auth_code,
          "from_date": defaultDate
        }
      }

      // consumimos EP de update item
      const res = await this.apiService.patch('profile/deliveries/' + this.list.id + '/item/' + item.id, itemToSend).toPromise<any>();

      if (res.data?.hasOwnProperty('show_modal') && res.data.show_modal) {
        this.auxItemToSend = {
          data: itemToSend,
          id: item.id
        };
        this.openWarningModal = true;
        this.messageWarningModal = res.message;
        return;
      }

      await this.getTotalList();

    } catch (e) {
      let msg = e?.error?.message || e?.message;
      this.matSnackbar.open(msg, null, {
        duration: 4000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  async confirmUpdateMed() {
    this.loadSpiner = true;
    let itemToSend = this.auxItemToSend.data;
    let itemId = this.auxItemToSend.id;
    // agregamos el campo confirmed para que el backend sepa que se confirmó el cambio de dosis
    itemToSend['confirmed'] = true;

    try {
      // consumimos EP de update item
      await this.apiService.patch('profile/deliveries/' + this.list.id + '/item/' + itemId, itemToSend).toPromise<any>();
      this.openWarningModal = false;
      this.loadSpiner = false;
      this.getTotalList();
    } catch (e) {
      this.matSnackbar.open(e.error.message, null, {
        duration: 4000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.loadSpiner = false;
    }
  }

  calculateDataByQuantity(item: any, event: any) {
    // evitamos que el usuario ingrese letras o caracteres especiales, solo números
    if (!/^[0-9]+$/.test(event.target.value)) {
      event.target.value = event.target.value.slice(0, -1); // eliminamos la última letra ingresada
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = setTimeout(async () => {
      try {
        // consumimos EP de update item
        await this.apiService.patch('profile/deliveries/' + this.list.id + '/item/' + item.id, {
          "portal_publication_id": item.publication.portal_publication_id,
          "delivery_method": "by_date",
          "quantity": item.quantity,
          "each": item.each,
          "duration": item.duration,
          "delivery_day": item.delivery_day,
          "covered_by_insurance": item.covered_by_insurance,
          "insurance_auth_number": item?.insurance_auth?.auth_code
        }).toPromise();

        await this.getTotalList();
      } catch (e) {
        let msg = e?.error?.message || e?.message;
        this.matSnackbar.open(msg, null, {
          duration: 4000,
          panelClass: "bg-danger",
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    }, 700);
  }

  async calculateDataByDay(item: any) {
    let itemValidate = [
      {
        "id": item.id,
        "delivery_day": item.delivery_day,
        "each": item.each,
      }
    ]
    // antes de calcular los datos, validamos el día que se está seleccionando
    this.itemsWarningDay = await this.listService.validateItemsByDay(itemValidate)

    if (this.itemsWarningDay.length > 0) {
      this.openWarningDayModal = true;
    }

    await this.calculateDataItem(item, 'by_date');
  }

  async calculateDataByEach(item: any) {
    item.duration = 'undefined'

    await this.calculateDataItem(item, 'by_date')
  }

  async goToWizard() {
    // Antes de ir al wizard, validamos que todos los campos de todos los items estén completos
    let flag = false;

    // Primero comprobamos que tenemos un método de entrega seleccionado
    if (!this.selectDeliveryMethod) {
      this.matSnackbar.open("Debes seleccionar un método de entrega", null, {
        duration: 5000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.showGeneralErrorMessage = true;
      return;
    }

    // verificamos que inputs vamos a validar según el método de entega
    flag = this.hasEmptyFields();

    if (flag) {
      this.showGeneralErrorMessage = true;
      return;
    }

    // validamos los items de la lista, donde si la fecha es hoy y la hora es mayor a las 14:00 entonces no se puede seleccionar esa fecha con el EP de validate-items
    if (this.selectDeliveryMethod == 'by_recipe') {
      let itemsToValidateDate = [];
      // recorremos todos los items para enviarlos al EP de validate-items-stock-date item.publication.portal_publication_id
      this.items.forEach((item: any) => {
        itemsToValidateDate.push({
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
        let res = await this.apiService.post('profile/validate-items-stock-date', {
          delivery_items: itemsToValidateDate
        });
      } catch (e) {
        this.itemsWarningDate = [];
        /* dentro de e.error.errors vienen los índices de los items que no cumplen con la validación así "delivery_items.0.stock_date", lo que haremos será recorrer todos los items a validar dentro de
        itemsToValidateDate y si el índice coincide con el índice que viene en e.error.errors agregaremos el item al array itemsWarningDate para mostrarlo en el modal */
        itemsToValidateDate.forEach((item: any, index: number) => {
          if (e.error.errors.hasOwnProperty('delivery_items.' + index + '.stock_date')) {
            this.itemsWarningDate.push(item);
          }
        });

        // si hay items que no cumplen con la validación, mostramos el modal
        if (this.itemsWarningDate.length > 0) {
          this.openWarningDateModal = true;
          flag = true;
        }
      }
    } else if (this.selectDeliveryMethod == 'by_date') {
      this.flagWarningDayModal = true;
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

      // antes de calcular los datos, validamos el día que se está seleccionando
      this.itemsWarningDay = await this.listService.validateItemsByDay(itemsToValidateDay)

      if (this.itemsWarningDay.length > 0) {
        this.openWarningDayModal = true;
        flag = true;
      }
    }

    // si no hay ningún input vacío, vamos al wizard
    if (!flag) {
      this.showGeneralErrorMessage = false;
      await this.router.navigate(['/web/wizard-register'], { queryParams: { accion_actual: 'informacion-personal' } });
    }
  }

  updateDeliveryDate() {
    // acutualiizamos la fecha de entrega de la delivery a la de mañana de los items dentro de itemsWarningDate y llamamos calculateDataItem para actualizar los datos de los items
    this.itemsWarningDate.forEach(async (item: any) => {
      item.stock_date = moment().add(1, 'days').format("YYYY-MM-DD");
      await this.calculateDataItem(item, this.list.delivery_method);
    });

    if (moment().format('HH:mm') > '14:00') {
      this.minStockDate = moment().add(1, 'days').toDate();
    }

    this.openWarningDateModal = false;
  }

  goWizardToDeliveryDay() {
    this.openWarningDayModal = false
    if (this.flagWarningDayModal) {
      // navegamos hacía el wizard si no tenemos campos incompletos
      setTimeout(() => {
        if (!this.hasEmptyFields())
          this.router.navigate(['/web/wizard-register']);
      }, 350)
    }

    this.flagWarningDayModal = false;
  }

  downloadDocument(file: any) {
    // descargamos el archivo con el link que nos devuelve la api (document_url)
    window.open(file.document_url, '_blank');
  }

  async deleteFile(file: any, event) {
    event.stopPropagation();

    // eliminamos el archivo de la delivery
    await this.apiService.delete('profile/deliveries/' + this.list.id + '/insurance-attachments/' + file.id).toPromise().then((response: any) => {
      this.matSnackbar.open("Archivo eliminado con éxito", null, {
        duration: 3500,
        panelClass: ["bg-success", "text-white", "flex", "justify-center"],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }).catch((error: any) => {
      this.matSnackbar.open("Error al eliminar el archivo", null, {
        duration: 3500,
        panelClass: ["bg-danger", "text-white", "flex", "justify-center"],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    });

    // obtenemos los archivos de la delivery para mostrarlos excepto el que eliminamos
    this.documentsFiles = await this.apiService.get('profile/deliveries/' + this.list.id + '/insurance-attachments').toPromise().then((response: any) => {
      return response.data;
    }).catch((error) => {
      return [];
    });
  }

  // función que nos ayudará a validar si algún input está vacío al momento de cerrar la ventana
  hasEmptyFields() {
    // Antes de ir al wizard, validamos que todos los campos de todos los items estén completos
    const inputsRecipe = document.querySelectorAll('.validate-by-recipe'); // obtenemos todos los inputs con la clase "validate-by-recipe"
    const inputsDate = document.querySelectorAll('.validate-by-date'); // obtenemos todos los inputs con la clase "validate-by-date"
    let flag = [];

    // verificamos que inputs vamos a validar según el método de entega
    if (this.selectDeliveryMethod == 'by_recipe') {
      // recorremos todos los inputs
      inputsRecipe.forEach((input: any) => {
        flag.push(this.validateEmptyField(input, 'by_recipe'));
      });
    } else if (this.selectDeliveryMethod == 'by_date') {
      // recorremos todos los inputs
      inputsDate.forEach((input: any) => {
        flag.push(this.validateEmptyField(input, 'by_date'));
      });
    }

    return flag.includes(true);
  }

  validateEmptyField(input: any, delivery_method: string = 'by_date') {
    let flag = false;
    // eliminamos todos los posibles mensajes que ya se hayan insertado
    input.parentElement.querySelectorAll('.valid-input-message').forEach((element: any) => {
      element.remove();
    });
    input.style.border = '1px solid #0038AE'; // Devolvemos el color del borde a azul

    // validamos que ningún input este vacío
    if (input.value == '') {
      flag = true;
      this.showGeneralErrorMessage = true;

      if (delivery_method !== 'by_date') {
        // incertamos el mensaje de validación debajo del input, el div con la clase valid-input-message
        input.insertAdjacentHTML('afterend', '<div class="valid-input-message w-full text-[#621B16] font-bold flex justify-start sm:justify-end items-center"><ion-icon name="alert-circle" class="text-[#621B16] text-base mr-1"></ion-icon> <p class="text-base">Este campo es obligatorio</p></div>');
      }
      input.style.border = '1px solid #F44336'; // hacemos el border del input rojo
    }

    return flag;
  }

  formatPorcentageNumber(value) {
    return value.split('.')[0];
  }

  // Función que nos ayudará a detectar si en un texto hay una palabra que tenga más de 18 caracteres y si la hay retornarmos true
  largeWord(text: string) {
    let words = text.split(' ');
    let flag = false;

    words.forEach((word: string) => {
      if (word.length > 18) {
        flag = true;
      }
    });

    return flag;
  }

  calculateDateDelivery(date: any) {
    // Mostraremos lo siguiente ej: 12 de enero de 2023. La fecha viene en list.delivery_date, viene en formato YYYY-MM-DD, obtenemos los datos y los mostramos en el formato que queremos
    let [deliveryYear, deliveryMonth, deliveryDay] = date.split("-");

    // creamos la fecha como texto ej: 12 de enero de 2023.
    return `${deliveryDay} de ${this.getMonthName(parseInt(deliveryMonth))}`;
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

  showInsurerTitle() {
    // Si tenemos datos en el array de batches asegurados, mostramos el título de asegurados
    return this.batches[0] && this.batches[0].batches.length > 0;
  }

  async closeWarning() {
    this.list.insurance_warning = false;

    await this.apiService.put('profile/' + this.list.id + '/manage-insurance-warning', {
      insurance_warning: false,
    }).toPromise();
  }

  goToInsurerSection () {
    const element = document.getElementById('insurer_documents');
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
        this.panelOpenStateDocuments = true;
      }, 200);
    }
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  getRows(count: number, itemsPerRow: number): number[][] {
    const segments = this.range(count);
    const rows = [];
    for (let i = 0; i < segments.length; i += itemsPerRow) {
      rows.push(segments.slice(i, i + itemsPerRow));
    }
    return rows;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateElementSize();
  }

  calculateElementSize() {
    const totalWidth = window.innerWidth;
    const padding = 80;
    const otherElements = 30 * 6;
    const availableWidth = totalWidth - padding - otherElements;
    this.elementSize = availableWidth / 5;
  }

  // Función para obtener el nombre basado en key y value
  getNameByKeyAndValue(key: string, valueToFind: number): string {
    const value = Number(valueToFind);
    const interval = Duration_Intervals[key]?.find((interval: { value: number; }) => interval.value === value);
    return interval ? interval.name : '';
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

  closeCodeBanner(): void {
    this.showBanner = false;
    // Guardamos el timestamp actual cuando se cierra el banner
    localStorage.setItem(BANNER_STORAGE_KEY, '0');
  }

  checkCodeBannerVisibility(): void {
    const bannerClosedDate = localStorage.getItem(BANNER_STORAGE_KEY);

    if (!bannerClosedDate) {
      this.showBanner = true;
      return;
    }

    this.showBanner = bannerClosedDate !== '0'
  }

  downloadPdf() {
    window.open(`${this.apiService.url}/profile/download-meds/${this.meInfo.id}`, '_blank');
  }
}
