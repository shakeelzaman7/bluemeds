import {Model} from '../core/data/resources/model';

export class BudgetListElement extends Model {
  public portal_publication_id: number = null;
  public default_currency: string = null;
  public active = false;
  public code: string = null;

  resourceName?(): string {
    return 'budgetList';
  }
}
