import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import icEmail from '@iconify/icons-ic/outline-email';
import {fadeInUp400ms} from 'src/app/@vex/animations/fade-in-up.animation';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import {AuthService} from 'src/app/core/auth/auth.service';
import {ListService} from '../services/list/list.service';
import {RedirectService} from 'src/app/@vex/services/redirect.service';
import {MessageDialogComponent} from "../../core/components/message-dialog/message-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {StorageService} from "../../core/storage/storage.service";
import {filter, first, switchMap} from 'rxjs/operators';
import {MatIconRegistry} from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';

const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>`;
const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInUp400ms,
    trigger('expandHeight', [
      state('void', style({ height: '0', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition(':enter', [animate('200ms ease-out')]),
      transition(':leave', [animate('200ms ease-in')]),
    ]),
  ]
})
export class LoginPage implements OnInit {

  form: FormGroup;

  inputType = 'password';
  visible = false;
  showMessageCredentials = false;
  messageError = "";

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;
  icEmail = icEmail;
  emailOptionActive : boolean = false;

  directionList = [
    {text: 'Inicio', route: '/web/home'},
    {text: 'Iniciar sesión', route: '/web/login'}
  ];

  messagesValidationInputs = {
    email: '',
    password: ''
  }

  constructor(private router: Router,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              private snackbar: MatSnackBar,
              private auth: AuthService,
              private listService: ListService,
              public layoutService: LayoutService,
              private redirectService: RedirectService,
              private dialog: MatDialog,
              private storage: StorageService,
              private sanitizer: DomSanitizer,
              iconRegistry: MatIconRegistry,
  ) {
    iconRegistry.addSvgIconLiteral('google_svg', sanitizer.bypassSecurityTrustHtml(GOOGLE_SVG));
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Si en la url tenemos un query param llamado type=must-change, mostramos un modal con el mensaje de que la contraseña debe ser cambiada
    this.validateMustChangePassword();
  }

  validateMustChangePassword() {
    this.router.routerState.root.queryParams.pipe(
      filter(params => params['type'] === 'must-change'),  // Filtra solo cuando 'type' es 'must-change'
      first(),  // Toma solo la primera emisión y se desuscribe
      switchMap(async () => {
        return await this.storage.get('must-change');
      })
    ).subscribe(message => {
      if (message) {
        this.dialog.open(MessageDialogComponent, {
          disableClose: false,
          width: '450px',
          data: {
            title: 'Cambio de contraseña',
            secondMessage: message,
            textButton: 'Cambiar contraseña',
            typeMessage: 'warning'
          }
        }).afterClosed().subscribe((response) => {
          if (response !== undefined) {
            this.router.navigateByUrl(`/web/forgot-password`);
          }
        });
      }
    });
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  redirectCreateAccount() {
    this.router.navigateByUrl('/web/register');
  }

  removeMesaageError() {
    this.showMessageCredentials = false;
    this.messageError = '';
  }

  async login() {
    try {
      await this.auth.login(this.form.value)

      const redirectUrl = this.redirectService.getRedirectUrl() || '/web/welcome';

      this.router.navigateByUrl(redirectUrl);
    } catch (e) {
      let msg = '';
      // verificar que el objeto e.error no este vacío
      if (e.error && e.error.message) {
        msg = e.error.message;
      }

      switch (e.status) {
        case 401:
          msg = 'Credenciales incorrectas, ingresa las credenciales correctas para iniciar sesión.';
          break;
        case 403:
          msg = 'Tu cuenta está cancelada. Para reactivarla comunícate al PBX 1750, opción 5.';
          break;
        default:
          msg = 'Credenciales incorrectas, ingresa las credenciales correctas para iniciar sesión.';
          break;
      }


      this.showMessageCredentials = true;
      // let msg = 'No pudimos validar tus credenciales, por favor revísalas o vuelve a ingresarlas';
      this.messageError = msg;

      // hacemos un focus al input de email
      const emailInput = document.getElementById('email-in');
      emailInput.focus();

      /* this.snackbar.open(msg, null, {
        duration: 10000,
        panelClass: 'bg-danger',
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });*/
    }
  }

  loginProvider(provider: string) {
    try {
      this.auth.loginProvider(provider, true);
    } catch (e) {
      const error = e.error || e.error.message || 'Error al iniciar sesión';

      this.snackbar.open(error, null, {
        duration: 5000,
        panelClass: 'bg-danger',
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  toggleEmailOption() {
    this.emailOptionActive = !this.emailOptionActive;
  }

  validationInputs(inputValidate: string) {
    if (inputValidate === 'email') {
      // retornamos mensaje de validación para email (no vacío y formato de email)
      const email = this.form.get('email');
      this.form.patchValue({
        email: email.value.toLowerCase()
      });

      // eslint-disable-next-line max-len
      if (email.value && !email.value.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) { // validamos el email.value tenga un formato de email
        this.messagesValidationInputs.email = 'El email no tiene un formato válido';
        return;
      }

      if (email.hasError('required')) { // validamos que el campo no este vacío
        this.messagesValidationInputs.email = 'El email es requerido';
        return;
      }

      this.messagesValidationInputs.email = '';
    }

    if (inputValidate === 'password') {
      // retornamos mensaje de validación para password (no vacío)
      const password = this.form.get('password');
      if (password.hasError('required')) { // validamos que el campo no este vacío
        this.messagesValidationInputs.password = 'La contraseña es requerida';
        return;
      }

      this.messagesValidationInputs.password = '';
    }
  }
}
