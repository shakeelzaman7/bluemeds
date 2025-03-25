import {Component, OnInit} from '@angular/core';
import {ResourcesService} from '../../core/data/resources/resources-service.service';
import {Intervals, Semantics} from 'src/app/models/dosage-intervals';
import {Frequency} from 'src/app/models/frequency';
import {BudgetService} from '../services/budget/budget.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import { AlertController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import circleAdd from '@iconify/icons-ic/round-add-circle-outline';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
})
export class BudgetPage implements OnInit {

  circleAdd = circleAdd;
  budgetList: any [];
  dosageIntervals = Intervals;
  dosageSemantics = Semantics;
  frequencies: Frequency[];
  timerId = null;

  directionList = [
    {text: 'Inicio', route: '/web/home'},
    {text: 'Cotizador de medicamentos', route: '/web/budget'}
  ];

  constructor(
    private resourceService: ResourcesService,
    public layoutService: LayoutService,
    public budgetService: BudgetService,
    private alertController: AlertController,
    private matSnackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.start();
  }

  async start() {
    this.getFrequencies();
    await this.budgetService.initList();

    const dosageInt = this.dosageIntervals;
    const budgetSer = this.budgetService;
    // si tenemos datos en budgetService.budgetList
    if (this.budgetService.budgetList.length > 0) {
      // recorremos el arreglo para obtener la dosis y ver si pertenece a alguna dosis guardada en código
      this.budgetService.budgetList.forEach(function (element, i) {
        const index = dosageInt[element.packaging].findIndex((item) => item.value == element.dosage);

        if (index != -1) {
          budgetSer.budgetList[i].dosage = element.dosage
          budgetSer.budgetList[i].auxDosage = element.dosage
          budgetSer.budgetList[i].showOther = false
        } else {
          budgetSer.budgetList[i].auxDosage = element.dosage
          budgetSer.budgetList[i].otherDosage = element.dosage
          budgetSer.budgetList[i].showOther = true
        }
      });
    }
    this.budgetService = budgetSer;
  }

  async initList() {
    this.budgetList = await this.budgetService.getItemsFromStorage();
    if (this.budgetList.length > 0) {
      this.budgetService.calculateBudget();
    }
  }

  async getFrequencies() {
    this.frequencies = (await this.resourceService.getResource(Frequency).index({paginate: false})).data;
  }

  async doseChange(item) {
    // su la dosis no se encuentra en la lista de dosis, mostramos el input de otra dosis
    const index = this.dosageIntervals[item.packaging].findIndex((element) => element.value == item.dosage);
    if (index == -1) {
      // mostramos modal para ingresar dosis personalizada
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Dosis personalizada (' +  item.packaging + ')',
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
              item.dosage = item?.auxDosage;
            }
          }, {
            text: 'Ok',
            handler: async (data) => {
              // validamos que la dosificación que se está ingresando es válida antes de guardarla
              var itemToValidate = {
                "id": null,
                "portal_publication_id": item.portal_publication_id,
                "dose": data.otraDosis,
                "frequency_id": item.frequency_id,
                "frequency": null,
                "publication": null,
                "stock_date": item.stock_date,
              };

              try {
                const response = await this.budgetService.validateItem(itemToValidate);

                if (response.success) {
                  item.dosage = Number(data.otraDosis);
                  item.otherDosage = Number(data.otraDosis);
                  item.showOther = true;
                  await this.budgetService.calculateBudget();
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
        ]
      });

      await alert.present();
    } else {
      var itemValidate = {
        "id": null,
        "portal_publication_id": item.portal_publication_id,
        "dose": item.dosage,
        "frequency_id": item.frequency_id,
        "frequency": null,
        "publication": null,
        "stock_date": item.stock_date,
      };

      try {
        const response = await this.budgetService.validateItem(itemValidate);

        if (response.success) {
          item.showOther = false;
          await this.budgetService.calculateBudget();
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

    // await this.budgetService.calculateBudget();
  }

  changeQuantity(event) {
    // evitamos que el usuario ingrese letras o caracteres especiales, solo números
    if (!/^[0-9]+$/.test(event.target.value)) {
      event.target.value = event.target.value.slice(0, -1); // eliminamos la última letra ingresada
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.budgetService.calculateBudget();
    } , 700);
  }

  formatPorcentageNumber(value) {
    return value.split('.')[0];
  }
}
