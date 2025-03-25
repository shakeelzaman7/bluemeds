import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DeliveryItem } from 'src/app/models/delivery-item';
import { Frequency } from 'src/app/models/frequency';
import { Publication } from 'src/app/models/publication';
import { ListService } from '../../services/list/list.service';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { Intervals, Semantics } from 'src/app/models/dosage-intervals';
import { Cast } from 'src/app/core/data/cast';
import moment from 'moment';
import { AuthService } from 'src/app/core/auth/auth.service';
import { BudgetService } from '../../services/budget/budget.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController } from '@ionic/angular';
import { MatDialog } from '@angular/material/dialog';
import {Router} from '@angular/router';
import {ConfirmationDialogComponent} from "../../../core/components/confirmation-dialog/confirmation-dialog.component";
import {Duration_Intervals, Each_Intervals} from "../../../models/durations-intervals";
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import { IonSlides } from '@ionic/angular';
import { ApiService } from 'src/app/core/api/api.service';
import { LayoutService } from 'src/app/@vex/services/layout.service';

const EXCLAMATION_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.713T12 7q-.425 0-.713.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/></svg>`;

@Component({
  selector: 'app-publication-modal',
  templateUrl: './publication-modal.component.html',
  styleUrls: ['./publication-modal.component.scss'],
})
export class PublicationModalComponent implements OnInit, AfterViewInit {
  @ViewChild('slides') slides: IonSlides;

  deliveryItem: DeliveryItem = new DeliveryItem();
  publication: Publication;
  frequencies: Frequency[];
  budgetList: any[];
  dosageIntervals = Intervals;
  dosageSemantics = Semantics;
  todayDate: Date = new Date();
  doseSelected: number = null;
  flagOtherDose: boolean = false;
  flagShowLoadImages: [boolean, boolean, boolean] = [true, true, true];
  countErrorImages: number = 0;
  durationIntervals = Duration_Intervals;
  eachIntervals = Each_Intervals;
  delivery_method: string = null;
  otherDosageValue: number = null;
  minStockDate = new Date();
  maxStockDate: Date;
  flagValidateInputs: { [key: string]: boolean } = {
    day: false,
    quantity: false,
    duration: false,
    each: false,
    dose: false,
    frequency: false,
    stock_date: false,
    from_date: false,
  };
  fromDateData: any[] = [];
  saving: boolean = false;
  daysToSelect = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  portal_monthly_price: string = null;
  monthly_total_savings_calculate: string = null;
  percentage_savings_calculate: string = null;
  delivery_id: number = null;
  showDetails: boolean = true;
  showDeliveryData: boolean = true;
  showPrice: boolean = true;

  constructor(
    public listService: ListService,
    private modalCtrl: ModalController,
    private resourceService: ResourcesService,
    private authService: AuthService,
    private budgetService: BudgetService,
    private translate: TranslateService,
    private matSnackbar: MatSnackBar,
    private alertController: AlertController,
    private matDialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer,
    private api: ApiService,
    public layoutService:LayoutService,
    iconRegistry: MatIconRegistry,
  ) {
    translate.setDefaultLang('es');
    translate.use(navigator.language.slice(0, 2));
    iconRegistry.addSvgIconLiteral('exclamation-info', sanitizer.bypassSecurityTrustHtml(EXCLAMATION_INFO));

    this.maxStockDate = new Date();
    this.maxStockDate.setDate(this.maxStockDate.getDate() + 90);
  }

  formatDate(date, format) {
    // si date tiene el formato DD/MM/YYYY, lo convertimos a YYYY-MM-DD para que moment lo pueda interpretar
    if (date && date.toString().includes('/')) {
      const dateSplit = date.split('/');
      date = dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0];
    }

    return moment(date).format(format);
  }

  async ngOnInit() {
    if (this.deliveryItem?.publication) {
      this.publication = Cast.cast(Publication, this.deliveryItem?.publication);
    }
    if (!this.deliveryItem.stock_date && this.delivery_method == 'by_recipe') {
      this.deliveryItem.stock_date = moment().format('YYYY-MM-DD');
    }
    if (this.delivery_method == 'by_recipe')
      this.getFrequencies();

    // Verificamos si la dosis que viene se encuentre en nuestra lista de dosis, si no es así, es porque fue una dosis personalizada y marcaremos la opción de "Otra dosis"
    if (this.deliveryItem.dose) {
      if (this.deliveryItem.dose != 0) {
        /* buscaremos en dosage-intervals donde el nombre del arreglo sea el de publication.product.presentation, si encontramos uno significa que es una dosis no personalizada, por lo tanto
        * doseSelected será igual a la dosis sino será igual a -1, recordemos que dosageIntervals es un objeto que contiene arreglos y el arreglo tiene objeteos que se componen por value y name*/
        const index = this.dosageIntervals[this.publication.product.presentation?.trim()]?.findIndex((item) => item.value == this.deliveryItem.dose);

        if (index != -1) {
          this.doseSelected = this.deliveryItem.dose;
        } else {
          this.doseSelected = -1;
          this.flagOtherDose = true;
        }
      } else {
        this.deliveryItem.dose = null;
        this.doseSelected = null;
      }
    }

    // si quantity es 0, lo cambiamos a null
    if (this.deliveryItem.quantity == 0) {
      this.deliveryItem.quantity = null;
    }

    if (this.deliveryItem?.more_info) {
      this.portal_monthly_price = this.deliveryItem.more_info.portal_monthly_price;
      this.monthly_total_savings_calculate = this.deliveryItem.more_info.monthly_total_savings;
      this.percentage_savings_calculate = this.deliveryItem.more_info.percentage_savings;
    }

    // si tenemos datos en delivery_day y each, obtenemos los datos para el campo "desde"
    if (this.deliveryItem.delivery_day && this.deliveryItem.each) {
      await this.deliveryDayChange();
    }

    // si tenemos insurance_auth tomamos el valor de auth_code
    if (this.deliveryItem?.insurance_auth) {
      this.deliveryItem.insurance_auth_number = this.deliveryItem.insurance_auth.auth_code;
    }

    if (this.layoutService.isMobile() && this.deliveryItem.id) {
      this.showDetails = false;
      this.showDeliveryData = false;
      this.showPrice = false;
    }
  }

  async close() {
    // eliminamos el parámetro product_name de la url
    const url = window.location.href.split('?')[0];
    if (url) {
      window.history.replaceState({}, document.title, url);
    }

    await this.modalCtrl.dismiss();
  }

  async deleteFromList() {
    if (await this.authService.isAuthenticated()) {
      if (!this.deliveryItem.portal_publication_id) {
        this.deliveryItem.portal_publication_id = this.publication.portalPublicationId;
      }
      await this.listService.deleteDeliveryItem(this.deliveryItem.id);
    }
    await this.modalCtrl.dismiss({
      deleted: true
    });
  }

  async addToList() {
    try {
      if (await this.authService.isAuthenticated()) {
        if (!this.deliveryItem.portal_publication_id) {
          this.deliveryItem.portal_publication_id = this.publication.portalPublicationId;
          this.deliveryItem.delivery_method = this.delivery_method;
        }
        // validamos inputs dependiendo del método de entrega
        if (this.delivery_method) {
          // hacemos a todos los inputs false
          Object.keys(this.flagValidateInputs).forEach((key) => {
            this.flagValidateInputs[key] = false;
          });

          if (this.delivery_method == 'by_date') {
            if (!this.deliveryItem.quantity)
              this.flagValidateInputs.quantity = true;
            if (!this.deliveryItem.duration)
              this.flagValidateInputs.duration = true;
            if (!this.deliveryItem.each)
              this.flagValidateInputs.each = true;
            if (!this.deliveryItem.delivery_day)
              this.flagValidateInputs.day = true;
            if (!this.deliveryItem.from_date) {
              this.flagValidateInputs.from_date = true;
            } else {
              if (this.deliveryItem.from_date && this.deliveryItem.from_date.toString().includes('/')) {
                // para evitar problemas con la fecha damos formato de YYYY-MM-DD
                const dateSplit = this.deliveryItem.from_date.split('/');
                this.deliveryItem.from_date = dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0];
              }
              // damos formato de DD/MM/YYYY a la fecha
              this.deliveryItem.from_date = moment(this.deliveryItem.from_date).format('DD/MM/YYYY');
            }

            this.deliveryItem.dose = null;
            this.deliveryItem.stock_date = null;
          } else if (this.delivery_method == 'by_recipe') {
            if (!this.deliveryItem.dose)
              this.flagValidateInputs.dose = true;
            if (!this.deliveryItem.stock_date || this.deliveryItem.stock_date == 'Invalid Date') {
              this.flagValidateInputs.stock_date = true;
            } else {
              if (this.deliveryItem.stock_date && this.deliveryItem.stock_date.toString().includes('/')) {
                // para evitar problemas con la fecha damos formato de YYYY-MM-DD
                const dateSplit = this.deliveryItem.stock_date.split('/');
                this.deliveryItem.stock_date = dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0];
              }
              // damos formato de DD/MM/YYYY a la fecha
              this.deliveryItem.stock_date = moment(this.deliveryItem.stock_date).format('DD/MM/YYYY');
            }
            if (!this.deliveryItem.frequency_id)
              this.flagValidateInputs.frequency = true;

            this.deliveryItem.quantity = null;
          }

          // si algunas de las validaciones es true, retornamos
          if (Object.values(this.flagValidateInputs).includes(true)) {
            return;
          }
        } else {
          this.deliveryItem.quantity = null; // puede que vengamos de la vista de cotizador o estemos agreando un nuevo Item, por lo tanto, quantity será null
        }

        this.saving = true;
        const res = await this.listService.add(this.deliveryItem);
        this.saving = false;

        if (res.data?.hasOwnProperty('show_modal') && res.data.show_modal) {
          await this.modalCtrl.dismiss(
            {
              information: res,
              deliveryItem: this.deliveryItem
            }
          );
          return;
        }

        // preguntamos si el usuario quiere ir al cotizador o seguir buscando medicamentos, solo si estoy en la vista web/search
        if (this.router.url.includes('web/search')) {
          await this.matDialog.open(ConfirmationDialogComponent, {
            width: '500px',
            panelClass: 'custom-padding-class-dialog',
            data: {
              message: 'Agrega más medicamentos o escoge tu fecha de entrega mensual',
              buttonText_1: 'Agregar más medicamentos',
              buttonText_2: 'Escoger fecha de entrega',
              showTitle: false,
              invertStyle: true
            }
          }).afterClosed().subscribe(async (result) => {
            if (result) {
              this.router.navigateByUrl("/web/list");
            }
          });
        }
      } else {
        // Agregamos el item a la cotización y reenviamos al cotizador
        var item = {
          "portal_publication_id": this.publication.portalPublicationId, // eslint-disable-line
          "quantity": 1
        }
        await this.budgetService.addItemToBudgetList(item);

        // preguntamos si el usuario quiere ir al cotizador o seguir buscando medicamentos
        await this.matDialog.open(ConfirmationDialogComponent, {
          width: '500px',
          panelClass: 'custom-padding-class-dialog',
          data: {
            message: '¿Quieres seguir buscando medicamentos o deseas continuar a tu lista de medicamentos?',
            buttonText_1: 'Seguir buscando',
            buttonText_2: 'Continuar a tu lista',
            showTitle: false,
          }
        }).afterClosed().subscribe(async (result) => {
          if (result) {
            this.router.navigateByUrl("/web/budget");
          }
        });
      }
      await this.modalCtrl.dismiss(
        {
          itemValidate: [this.deliveryItem]
        }
      );
    }
    catch (e) {
      let msg = 'Ocurrió un error: ' + e.error?.message;
      if (e.status == 422) {
        msg = e.error?.message ?? "El formulario tiene errores";
      }

      this.matSnackbar.open(msg, null, {
        duration: 6000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.saving = false;
    }
  }

  async getFrequencies() {
    this.frequencies = (await this.resourceService.getResource(Frequency).index({ paginate: false })).data;
  }

  async selectDoseChange(event) {
    // si event.target.value es -1 es porque se seleccionó "Otro"
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Dosis personalizada (' + this.publication.product.presentation + ')',
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
            this.doseSelected = null;
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.deliveryItem.dose = Number(data.otraDosis);
            this.flagOtherDose = true;
          }
        }
      ]
    });

    // Si event.target.value es null o -1 es porque se seleccionó "Otro"
    if (event.target.value == '-1') {
      await alert.present();
    } else {
      this.deliveryItem.dose = Number(event.target.value);
      this.flagOtherDose = false;
    }
  }

  validateErrorImage(index) {
    this.flagShowLoadImages[index] = false;
    this.countErrorImages++;
  }

  nextPrevSlide(nextPrev: string) {
    if (nextPrev == 'next')
      this.slides.slideNext();
    else
      this.slides.slidePrev();
  }

  formatPorcentageNumber(value) {
    return value.split('.')[0];
  }

  async changeEach() {
    this.deliveryItem.duration = 'undefined'
    this.calculate_total_savings();

    // si tenemos datos en delivery_day y each, obtenemos los datos para el campo "desde"
    if (this.deliveryItem.delivery_day && this.deliveryItem.each)
      this.deliveryDayChange();
  }

  changeDuration(event: any) {
    let value = event.target.value;

    if (value == "2" || value == "4") {
      this.monthly_total_savings_calculate = "0.00";
      this.percentage_savings_calculate = "0";
      
      this.getTotalData();
    } else {
      this.calculate_total_savings();
    }
  }

  showBluemedsPrice() {
    // Si la duración es 1 o 2 meses (2, 4) mostramos precio normal
    return !(this.deliveryItem.duration == "2" || this.deliveryItem.duration == "4");
  }

  calculate_total_savings() {
    // Si la duración es 1 o 2 meses (2, 4) no se calcula el ahorro
    if (this.deliveryItem.duration == "2" || this.deliveryItem.duration == "4") {
      this.monthly_total_savings_calculate = "0.00";
      this.percentage_savings_calculate = "0";

      this.getTotalData();

      return;
    }

    let percetaje_discount = ((parseFloat(this.deliveryItem.publication.normal_price_text) - parseFloat(this.deliveryItem.publication.bluemeds_price_text))
      / parseFloat(this.deliveryItem.publication.normal_price_text)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    this.monthly_total_savings_calculate = (this.deliveryItem.quantity * parseFloat(this.deliveryItem.publication.normal_price_text) *
      parseFloat(percetaje_discount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    this.percentage_savings_calculate = (parseFloat(this.monthly_total_savings_calculate.replace(',', '')) / (parseFloat(this.deliveryItem.publication.normal_price_text) *
      this.deliveryItem.quantity) * 100).toString();

    const numberValue = parseFloat(this.percentage_savings_calculate); // Si this.percentage_savings_calculate es una cadena que representa un número
    const roundedUp = Math.ceil(numberValue); // Redondear hacia arriba
    const roundedDown = Math.floor(numberValue); // Redondear hacia abajo
    this.percentage_savings_calculate = (numberValue - roundedDown) < 0.5 ? roundedDown.toString() : roundedUp.toString(); // redondeamos hacía donde corresponde

    this.getTotalData();
  }

  async getTotalData() {
    const url = 'profile/deliveries/' + this.delivery_id + '/item/' + this.deliveryItem.id + '/get-totals?quantity=' + this.deliveryItem.quantity + '&duration=' + this.deliveryItem.duration + '&each=' + this.deliveryItem.each;

    let data = await this.api.get(url).toPromise<any>();

    if (data?.success) {
      this.portal_monthly_price = data.data.portal_monthly_price;
      this.monthly_total_savings_calculate = data.data.monthly_total_savings;
    }
  }

  async deliveryDayChange() {
    // obtenemos los datos pora mostarlos en el campo "desde"
    let data = await this.api.get('profile/deliveries/'+ this.delivery_id + '/item/' + this.deliveryItem.id + '/options-from?delivery_day=' + this.deliveryItem.delivery_day + '&each=' + this.deliveryItem.each).toPromise<any>();
    this.fromDateData = data.options

    // seteamos el primer valor del arreglo fromDateData al campo "desde"
    this.deliveryItem.from_date = this.fromDateData[0];
  }

  ngAfterViewInit(): void {

  }
}
