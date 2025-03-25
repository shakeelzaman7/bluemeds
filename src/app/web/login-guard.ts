import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthGuard } from "src/app/core/auth/auth-guard.service";
import { AuthService } from "src/app/core/auth/auth.service";
import { ApplicationGuardBase } from "src/app/services/application-guard/application-guard.service";
import { environment } from "src/environments/environment";

@Injectable()
export class LoginGuard implements CanActivate {
 
  constructor(private auth:AuthService, private router:Router) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const authenticated = await this.auth.isAuthenticated();
    if(authenticated)
    {
        this.router.navigateByUrl(environment.initialRoute);
    }

    return !authenticated;
  }
}