import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { ConfigName } from "../@vex/interfaces/config-name.model";
import { ConfigService } from "../@vex/services/config.service";
import { NavigationService } from "../@vex/services/navigation.service";

@Injectable()
export class WebGuard implements CanActivate {

  constructor(protected navigationService:NavigationService, protected configService: ConfigService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.configService.setConfig(ConfigName.ikaros);
    this.navigationService.items.splice(0);
    return true;
  }
}
