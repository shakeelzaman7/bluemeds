import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AuthService } from "./auth.service";
import { RedirectService } from 'src/app/@vex/services/redirect.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(protected authenticationService: AuthService, protected router: Router,  private redirectService: RedirectService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise(async (resolve, reject) =>  {
      const isAuthenticated = await this.authenticationService.isAuthenticated();

      if (!isAuthenticated)
      {
        this.redirectService.setRedirectUrl(state.url);
        this.router.navigateByUrl(environment.redirectUnauthenticated);
      }

      resolve(isAuthenticated);
    });
  }
}
