import {EventEmitter, Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {LoginData} from './LoginData';
import {StorageService} from '../storage/storage.service';
import {Router} from '@angular/router';
import {Requirements} from 'src/app/data-handlers/api-data/api-data.service';
import {Cast} from '../data/cast';
import { HttpErrorResponse } from '@angular/common/http';
import { ForgotPasswordData, LoginGoogleResponse, RegisterData, Token } from 'src/app/@vex/interfaces/auth.interface';
import { PersonalDataProviderResponse } from 'src/app/@vex/interfaces/personal-information.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static KEY = 'TOKEN';
  token: Token;
  me: any;

  authStatusChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private api: ApiService, private storage: StorageService, private router: Router) {
    this.hasToken();
  }

  get meInfo() {
    return this.me;
  }

  // función para obtener el 'me' refrescado en caso de que se haya actualizado desde otra vista algún valor del me
  async getMeRefresh() {
    const meData = await this.api.me();
    this.me = meData.data;
  }

  async isAuthenticated() {
    const hasToken = await this.hasToken();
    if (hasToken) {
      try {
        if (this.me) {return true;}
        await this.getMeRefresh();
        return true;
      }
      catch (e) {
        // si el error es de cambio de contraseña y redirigimos al cambio de contraseña
        if(e instanceof HttpErrorResponse && e.error && e.error?.data?.password_must_be_changed) {
          await this.clearSession();

          await this.storage.set('must-change', e?.error?.message);
          // navegamos al login con el queryparam type=must-change
          await this.router.navigateByUrl(`/web/login?type=must-change`);
          return true;
        }

        await this.storage.clear();
        return false;
      }
    }
    return false;
  }

  async validateReferenceCode() {
    await this.getMeRefresh();

    // We save the reference code in the storage in the token key and in the reference_code property
    this.token.reference_code = this.me?.reference_code;
    await this.storage.set(AuthService.KEY, this.token);
  }

  async hasToken(): Promise<boolean> {
    if (!this.token)
      {this.token = await this.storage.get(AuthService.KEY);}
    return this.token != null;
  }

  async list(): Promise<any> {
    return await this.api.get('profile/deliveries').toPromise<any>();
  }

  async register(loginData: RegisterData): Promise<boolean> {
    try {
      const response = await this.api.post('register', loginData);
      const loginResponse = await this.login(loginData, false);
      this.token = loginResponse;
      this.save(loginResponse);
      this.authStatusChanged.emit(true);
      await this.router.navigateByUrl('web/first-steps');
      return response;
    }
    catch (e) {
      throw e;
    }
  }

  async registerRequirements(): Promise<Requirements> {
    return Cast.cast(Requirements, (await this.api.post('register?_endpoint_rules', {})).data);
  }

  async confirmPasswordReset(value: any, rulesOnly: boolean = false) {
    return await this.api.post('reset-password' + (rulesOnly ? '?=_endpoint_rules' : ''), value);
  }

  async resetPassword(value: ForgotPasswordData) {
    return await this.api.post('forgot-password', value);
  }

  async login(loginData: LoginData, redirect: boolean = false): Promise<Token> {
    try {
      const response = await this.api.post('login', loginData);
      this.token = response;
      this.save(response);
      if(redirect)
        {await this.router.navigateByUrl('web/welcome');}

      this.authStatusChanged.emit(true);
      return response;
    }
    catch (e) {
      await this.storage.clear();
      throw e;
    }
  }

  async loginProvider(provider: string, redirect: boolean = false) {
    try {
      const response = await this.api.get<LoginGoogleResponse>(`login/${provider}`).toPromise();

      if (response && response.success) {
        // redirect to the url
        window.location.href = response.redirect_to;
      }
    } catch (e) {
      throw e;
    }
  }

  save(response: Token): Token {
    this.storage.set(AuthService.KEY, response);
    return response;
  }

  async logout() {
    await this.clearSession();
    await this.router.navigate(['/web/home']);
  }

  async clearSession() {
    await this.storage.clear();
    this.token = null;
    this.authStatusChanged.emit(false);
  }

  public async isAuthenticatedNoLogin(tokenNoLogin: string, deliveryId: string) {
    // eslint-disable-next-line max-len
    return await (this.api.get(
      'payments/payment-method/validate-token?token=' + tokenNoLogin + '&delivery_id=' + deliveryId
    ).toPromise()).then((result) => {
      return true;
    }).catch((error) => false);
  }

  async manageAuthToken(token: string, newAccount: string) {
    try {
      this.token = {
        token: token,
        token_type: 'Bearer',
        reference_code: null
      };
      let updatedToken = { ...this.token };

      await this.getMeRefresh();
      updatedToken.reference_code = this.me?.reference_code;

      this.token = updatedToken;
      this.save(this.token);

      const navigateTo = newAccount == 'true' ? 'web/first-steps' : 'web/welcome';
      await this.router.navigateByUrl(navigateTo);
      this.authStatusChanged.emit(true);

    } catch (e) {
      throw e;
    }
  }

  async getPersonalDataByProvider(provider: string = 'google') {
    const response = await this.api.get<PersonalDataProviderResponse>(`profile/providers/${provider}/personal-data`).toPromise();

    return response;
  }
}
