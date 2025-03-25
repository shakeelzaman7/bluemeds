import {Injectable} from '@angular/core';
import {ApiService} from 'src/app/core/api/api.service';
import {StorageService} from 'src/app/core/storage/storage.service';
import {Router} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  public budgetList: any[];
  public percentageTotalSavings: number;
  public portalPriceTotal: number;
  public totalSavings: number;

  constructor(private storage: StorageService, private apiService: ApiService, private router: Router, private matSnackbar: MatSnackBar) {}

  async initList() {
    this.budgetList = await this.getItemsFromStorage();
    if(this.budgetList.length > 0)
      this.calculateBudget();
  }

  async getList() {
    await this.initList();
    return this.getItemsFromStorage();
  }

  async getItemsFromStorage(): Promise<any[]> {
    return await this.storage.get('BUDGET_LIST_CACHE', []);
  }

  async addItemToBudgetList(item) {
    this.budgetList = await this.getItemsFromStorage();
    const first = this.budgetList.find((obj) => {
      return obj.portal_publication_id === item.portal_publication_id;
    })

    // Si el ítem esta en la lista no se agrega
    if(first) {
      // console.error("Item "+item.portal_publication_id+" ya se encuentra en la lista");
      this.matSnackbar.open('El medicamento ' + first?.name + ' ya se encuentra en tu lista' , null, {
        duration: 5000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    } else {
      this.budgetList.push(item);
      await this.calculateBudget();
    }
    // this.router.navigateByUrl("/web/budget");

    return;
  }

  async removeBudgetItem(item) {
    this.budgetList = await this.getItemsFromStorage();
    this.budgetList = this.budgetList.filter((obj) => {
      return obj.portal_publication_id !== item.portal_publication_id;
    });
    await this.calculateBudget();
  }

  async calculateBudget() {
    const payload = { list: this.budgetList };
    const result = await this.apiService.post('budget', payload);
    this.percentageTotalSavings = result.total_percentage_savings;
    this.portalPriceTotal = result.portal_price_total;
    this.totalSavings = result.total_savings;
    this.budgetList = result.budget;
    await this.storage.set('BUDGET_LIST_CACHE', this.budgetList);
  };

  async deleteBudget() {
    await this.storage.set('BUDGET_LIST_CACHE', []);
  }

  async validateItem(payload) {
    return await this.apiService.post('profile/validate-item', payload);
  }
}
