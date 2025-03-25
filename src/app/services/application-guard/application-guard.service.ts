import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { NavigationItem } from "src/app/@vex/interfaces/navigation-item.interface";
import { ConfigName } from "../../@vex/interfaces/config-name.model";
import { ConfigService } from "../../@vex/services/config.service";
import { NavigationService } from "../../@vex/services/navigation.service";
import { ApplicationsService } from "../applications/applications.service";

export abstract class ApplicationGuardBase implements CanActivate {
  menuItems: NavigationItem[];
  constructor(protected navigationService:NavigationService, protected configService: ConfigService, protected appsService:ApplicationsService, menuItems: NavigationItem[]) {
    this.menuItems = menuItems;
  }

  abstract onCanActivation() : void;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.navigationService.items = this.menuItems;
    this.configService.setConfig(ConfigName.apollo)
    await this.appsService.setAppColorByUrl(state.url)
    this.onCanActivation();
    return true;
  }
}