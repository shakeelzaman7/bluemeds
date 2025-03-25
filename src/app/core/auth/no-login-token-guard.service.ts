import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoLoginTokenAuthGuard implements CanActivate {
  public token: string;
  public deliveryId: string;

  constructor(
    protected authenticationService: AuthService,
    protected router: Router,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    this.token = next.queryParams.token;
    this.deliveryId = next.queryParams.delivery_id;
    return new Promise(async (resolve, reject) =>  {
      const isAuthenticated = await this.authenticationService.isAuthenticatedNoLogin(this.token, this.deliveryId);

      if (!isAuthenticated)
      {
        this.router.navigateByUrl(environment.redirectUnauthenticated);
      }

      resolve(isAuthenticated);
    });
  }
}
