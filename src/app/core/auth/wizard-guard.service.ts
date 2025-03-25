import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { RedirectService } from 'src/app/@vex/services/redirect.service';

@Injectable({
  providedIn: 'root'
})
export class WizardGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Obtén los datos del usuario desde AuthService
      await this.authService.getMeRefresh(); 
      const userInfo = this.authService.meInfo;

      // Verifica si wizard_done es true
      if (userInfo?.wizard_done) {
        return true; // Permite el acceso
      } else {
        // Redirige a una página específica si no ha completado el wizard
        this.redirectService.setRedirectUrl(state.url);
        this.router.navigate(['/web/wizard-register']);
        return false;
      }
    } catch (error) {
      this.router.navigate(['/web/login']); // Redirige al login en caso de error
      return false;
    }
  }
}
