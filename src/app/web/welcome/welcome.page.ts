import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from 'src/app/core/api/api.service';
import { PersonalInfo } from 'src/app/models/personal-info';
import {ListService} from "../services/list/list.service";
import {LoadingController} from '@ionic/angular';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { AuthService } from 'src/app/core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterProductsResponse, Product, CalendarEventResponse, EventDates } from 'src/app/@vex/interfaces/calendar.interface';
import { PaymentService } from 'src/app/core/data/resources/paymentService';
import { State } from 'src/app/models/state';
import { IonDatetime } from '@ionic/angular';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { getMonthByNumber } from 'src/app/@vex/utils/months-utils';
import moment from 'moment';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  animations: [
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })), // Estado inicial (elemento no existente)
      state('*', style({ height: '*', opacity: 1 })), // Estado final (elemento visible)
      transition(':enter', [animate('300ms ease-out')]), // Transición al entrar
      transition(':leave', [animate('300ms ease-in')]), // Transición al salir
    ]),
  ],
})
export class WelcomePage implements OnInit {
  @ViewChild('refModal') refModal: TemplateRef<any>;
  @ViewChild('deliveryMedsModal') deliveryMedsModal: TemplateRef<any>;
  @ViewChild('datePicker') datePicker!: IonDatetime;

  name: string;
  refCode: string;
  directionList = [{},];
  meds: any[] = [];
  showMed = true;
  allMedsActive: boolean = false;
  personal: PersonalInfo = {profile: {}} as any;
  list: any = null;

  productList: Product[] = [];

  highlightedDates: { date: string; textColor: string; backgroundColor: string; eventType: string; foundIn: string; batch_id?: number; order_id?: number }[] = [];
  eventDates: EventDates = {next_orders: { delivery_dates: [], payment_dates: [] }, past_orders: []};
  deliveryInfo: { delivery_date: string, payment_date: string, medsList: string[] } = { delivery_date: '', payment_date: '', medsList: [] };
  minDate: string = '';
  maxDate: string = '';
  states: State[] = [];
  cities: any[] = [];
  timerSearchByProducts: any;
  monthsForSelect: { value: '', name: '', year: 0 }[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private listService: ListService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    public dialog: MatDialog,
    private matSnackbar: MatSnackBar,
    private paymentService: PaymentService,
    public layoutService: LayoutService
  ) {
    this.setMinAndMaxDates();
    this.monthsForSelect = this.getMothsForSelect();
  }

  ngOnInit() {
    this.getStates();
    this.start().then(() => {
      this.removingArrow();
    });
  }

  removingArrow() {
    const dateTimeElement = document.querySelector('ion-datetime');
    const shadowRoot  = dateTimeElement.shadowRoot;
    const arrowIcon = shadowRoot .querySelector('.datetime-calendar .calendar-header .calendar-action-buttons .calendar-month-year ion-item ion-label ion-icon') as HTMLElement;
    const calendarMonthYear = shadowRoot .querySelector('.datetime-calendar .calendar-header .calendar-action-buttons .calendar-month-year') as HTMLElement;

    if (arrowIcon) {
      arrowIcon.style.display = 'none';
    }

    if (calendarMonthYear) {
      calendarMonthYear.style.pointerEvents = 'none';
    }
  }

  setMinAndMaxDates() {
    const currentDate = new Date();

    const minDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
    const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 4, 0);

    this.minDate = this.formatDateForDatetime(minDate);
    this.maxDate = this.formatDateForDatetime(maxDate);
  }

  formatDateForDatetime(date: Date): string {
    return date.toISOString();
  }

  async start() {
    this.refCode = this.authService.token.reference_code;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });

    loading.present();

    try {
      const personal = await this.api.get('profile', {}).toPromise<any>(); // obtenemos los datos de personal info
      if (personal.data) {
        if (personal.data.profile.hasOwnProperty('first_name')) {
          this.personal = personal.data;
          this.name = this.personal.profile.first_name;
        }
      }

      this.list = await this.listService.getlist();

      if (this.list?.wizard_done) {
        this.getProducts();
        this.getEventsCalendar();
      }

      /* Obtenemos los medicamentos que están dentro de cada batch denro de list.batches vienen dos arreglos, un arreglo de batches asegurados y otro
      de batches no asegurados, los recorremos para guardar los meds */
      let batches = [];
      if (this.list.batches.with_insurance.length > 0) {
        batches = batches.concat(this.list.batches.with_insurance);
      }

      if (this.list.batches.without_insurance.length > 0) {
        batches = batches.concat(this.list.batches.without_insurance);
      }

      if (batches.length > 0) {
        batches.forEach(batch => {
          batch.items.forEach((med: any) => {
            this.meds.push(med);
          });
        });
      }

      if (this.meds.length > 0) {
        this.allMedsActive = this.meds.some(med => (med.from_date && !this.isFromDateInFuture(med.from_date.from_date)) ?? false);
      } else {
        this.allMedsActive = false;
      }

      if (this.list?.address?.state_id) {
        this.cities = await this.paymentService.fetchCities(this.list.address.state_id);
      }

      loading.dismiss();

    } catch (error) {
      loading.dismiss();
    }
  }

  showMeds() {
    this.showMed = !this.showMed;
  }

  redirectTo(route: string): void {
    this.dialog.closeAll();
    this.router.navigate([route]);
  }

  isFromDateInFuture(fromDateString: string): boolean {
    if (!fromDateString) {
      return false;
    }

    const parts = fromDateString.split('/'); // Divide la fecha en partes: [día, mes, año]

    // Ten en cuenta que `parts[1] - 1` es necesario porque los meses en JavaScript son 0-indexados (0 es enero, 1 es febrero, etc.)
    const day = +parts[0];
    const month = +parts[1] - 1; // Los meses en JavaScript son 0-indexados
    const year = +parts[2];

    const from = new Date(year, month, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignora la hora actual para solo comparar las fechas

    return from > today;
  }

  async getProducts() {
    const products = await this.api.get<FilterProductsResponse>(`profile/deliveries/${this.list.id}/calendar/products`).toPromise();

    if (products) {
      this.productList = products.products;
    }
  }

  async getEventsCalendar(products: number[] = []) {
    this.highlightedDates = [];
    this.eventDates = await this.api.get<CalendarEventResponse>(`profile/deliveries/${this.list.id}/calendar`, {'products[]': products}).toPromise().then(res => res.dates);

    if (this.eventDates) {
      const allDates = [];

      this.eventDates.next_orders.delivery_dates.forEach(date => {
        allDates.push({
          date: moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          textColor: '#fff',
          backgroundColor: '#2851a3',
          eventType: 'next_order',
          foundIn: 'delivery_dates',
        });
      });

      this.eventDates.next_orders.payment_dates.forEach(date => {
        allDates.push({
          date: moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          textColor: '#000',
          backgroundColor: '#D7E9FA',
          eventType: 'next_order',
          foundIn: 'payment_dates',
        });
      });

      allDates.push(
        ...this.eventDates.past_orders.reduce((acc, order) => {
          acc.push({
            date: moment(order.delivery_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            textColor: '#fff',
            backgroundColor: '#2851a3',
            eventType: 'past_order',
            foundIn: 'delivery_dates',
            order_id: order.order_id
          });
          if (order.payment_date) {
            acc.push({
              date: moment(order.payment_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              textColor: '#000',
              backgroundColor: '#D7E9FA',
              eventType: 'past_order',
              foundIn: 'payment_dates',
              order_id: order.order_id
            });
          }
          return acc;
        }, [])
      );

      this.highlightedDates = allDates;
    }
  }

  async getEventData(payload: any, eventType: string): Promise<void> {
    this.deliveryInfo.medsList = [];
  
    try {
      const eventData = await this.api.get(`profile/deliveries/${this.list.id}/calendar/info`, payload).toPromise();
  
      if (!eventData) return;
  
      const formatDate = (date: string, isNextOrder: boolean): string => {
        return isNextOrder
          ? this.formatDateToText(date)
          : this.formatDateToText(moment(date.split('T')[0]).format('DD/MM/YYYY'));
      };
  
      this.deliveryInfo.delivery_date = formatDate(eventData.delivery_date, eventType === 'next_order');
      this.deliveryInfo.payment_date = formatDate(eventData.payment_date, eventType === 'next_order');
  
      this.deliveryInfo.medsList = eventType === 'next_order'
        ? eventData.products.map((product: any) => product.publication.product.name)
        : eventData.items.map((item: any) => item.product.name);
  
    } catch (error) {
      return;
    }
  }
  

  onDateChange(event: any) {
    const customEvent = event as CustomEvent;

    if (customEvent.detail.value !== '') {
      const selectedDate = new Date(customEvent.detail.value).toISOString().split('T')[0];
      const highlightedDate = this.highlightedDates.find(d => d.date === selectedDate);

      if (highlightedDate) {
        const payload = highlightedDate.eventType === 'next_order'
          ? {
            date: moment(highlightedDate.date).format('DD/MM/YYYY'),
            date_type: highlightedDate.foundIn === 'delivery_dates' ? 'delivery' : 'payment',
          }
          : {
            order_id: highlightedDate.order_id,
          };

        this.getEventData(payload, highlightedDate.eventType);
        this.openDeliveryMedsModal();

        this.datePicker.value = '';
      }
    }
  }

  changeYear(event: any) {
    const value = event.target.value;
    // We move to the selected month
    this.datePicker.reset(`${value}-01`);
    this.datePicker.value = '';
  }

  formatDateToText(date: string): string {
    const [day, month, year] = date.split('/');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const weekDay = weekDays[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const dayOfMonth = dateObj.getDate();

    return `${weekDay}, ${dayOfMonth} de ${monthName}`;
  }

  async closeWarning() {
    this.list.insurance_warning = false;

    await this.api.put('profile/' + this.list.id + '/manage-insurance-warning', {
      insurance_warning: false,
    }).toPromise();
  }

  multiSelectChange(event: { portal_publication_id: number; product_name: string; selected?: boolean }[]) {
    if (this.timerSearchByProducts) {
      clearTimeout(this.timerSearchByProducts);
    }

    this.timerSearchByProducts = setTimeout(() => {
      const selectedProducts = event.map((product: { portal_publication_id: number; }) => product.portal_publication_id);
      this.getEventsCalendar(selectedProducts);
    }, 1000);
  }

  async getStates() {
    this.states = await this.paymentService.fetchStates();
  }

  getStateName(stateId: number): string {
    const state = this.states.find(state => state.id === stateId);
    return state ? state.name : '';
  }

  getCityName(cityId: number): string {
    const city = this.cities.find(city => city.id === cityId);
    return city ? city.name : '';
  }

  getMothsForSelect() {
    // We get the months to fill a select with 3 months ahead and 3 months behind the current month
    const months = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (let i = currentMonth - 3; i <= currentMonth + 3; i++) {
      let month, year;

      if (i < 1) {
        month = 12 + i;
        year = currentYear - 1;
      } else if (i > 12) {
        month = i - 12;
        year = currentYear + 1;
      } else {
        month = i;
        year = currentYear;
      }

      months.push({
        value: year + '-' + (month < 10 ? `0${month}` : `${month}`),
        year: year,
        name: getMonthByNumber(month) + ' - ' + year,
      });
    }

    return months;
  }

  async openRefModal() {
    const text = `Te recomiendo suscribirte a mibluemeds.com, el programa de Blue Medical que te llega a dejar tus medicamentos todos los meses, para que nunca te falten a la hora de tomarlos.\n\nSuscríbete con mi código ${this.refCode} y obtén Q50 de descuento en tu primer pedido.\n\n* Recuerda ingresar mi código en el último paso antes de confirmar tu suscripción.`;
    try{
      await navigator.clipboard.writeText(text);
      this.dialog.open(this.refModal, {
        data: this.refCode,
        disableClose: true,
        autoFocus: false,
      });
    } catch (err) {
      const mess = 'Error al copiar el texto al portapapeles';
      this.matSnackbar.open(mess, null, {
        duration: 6000,
        panelClass: 'bg-danger',
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  openDeliveryMedsModal() {
    this.dialog.open(this.deliveryMedsModal, {
      disableClose: false,
      width: '450px',
      autoFocus: false,
    });
  }
}
