import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { WizardRegisterPage } from './wizard-register.page';
import { RedirectService } from "../../@vex/services/redirect.service";
import { Observable } from "rxjs";
import { ListService } from "../services/list/list.service";

@Injectable()
class WizardGuard implements CanActivate {
  constructor(protected router: Router,  private redirectService: RedirectService, private listService: ListService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise(async (resolve, reject) =>  {
      if (!this.listService.list) {
        await this.listService.getlist();
      }

      // validamos el wizard_done del list
      if (this.listService.list.data?.wizard_done) {
        this.router.navigateByUrl('web/welcome');
        resolve(false);
      }

      resolve(true);
    });
  }
}


const routes: Routes = [
  {
    path: '',
    component: WizardRegisterPage,
    canActivate: [WizardGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [WizardGuard]
})
export class WizardRegisterPageRoutingModule {}
