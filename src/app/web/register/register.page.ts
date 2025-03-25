/* eslint-disable max-len */
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import icEmail from '@iconify/icons-ic/outline-email';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import icSuccessCircle from '@iconify/icons-ic/twotone-check-circle-outline';
import { fadeInUp400ms } from 'src/app/@vex/animations/fade-in-up.animation';
import { AuthService } from 'src/app/core/auth/auth.service';
import { RegisterData } from 'src/app/@vex/interfaces/auth.interface';
import { ValidatableFormComponent } from 'src/app/core/components/validatable-form/validatable-form.component';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { Requirements } from 'src/app/data-handlers/api-data/api-data.service';
import { Country } from 'src/app/models/country';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import moment from 'moment';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { style, transition, trigger } from '@angular/animations';
import { animate } from '@angular/animations';
import { state } from '@angular/animations';

const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>`;
const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage implements OnInit {
  @ViewChild(ValidatableFormComponent) validateForm: ValidatableFormComponent;
  registerData: RegisterData = {} as any;
  form: FormGroup;
  inputType = 'password';
  visible = false;
  hasSubmitted = false;
  changeColorMaxCharacters = false;
  maxDate = moment().add(-18, 'years');

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;
  icSuccessCircle = icSuccessCircle;
  icEmail = icEmail;
  requirements: Requirements = new Requirements();
  countries: Country[];

  termsVisible = false;
  termsOk = false;

  messagesValidationInputs = {
    email: '',
    password: '',
    password_confirmation: '',
  };

  allChecksValid = false;
  passChecks = [
    {
      label:'8 o más caracteres',
      isValid: false
    },
    {
      label:'Letras mayúsculas + minúsculas',
      isValid: false
    },
    {
      label:'Al menos un número',
      isValid: false
    },
    {
      label:'Al menos un símbolo',
      isValid: false
    }
  ];
  emailOptionActive = false;

  get passwordFormControl() {
    return this.form.get('password') as FormControl;
  }

  get confirmPasswordFormControl() {
    return this.form.get('password_confirmation') as FormControl;
  }

  constructor(private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private auth: AuthService,
    private resourceService: ResourcesService,
    public layoutService: LayoutService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIconLiteral('google_svg', sanitizer.bypassSecurityTrustHtml(GOOGLE_SVG));
    iconRegistry.addSvgIconLiteral('chevron-down', sanitizer.bypassSecurityTrustHtml(CHEVRON_DOWN));
  }

  ngOnInit() {
    this.start();
  }

  async getCountries() {
    this.countries = (await this.resourceService.getResource(Country).index({ paginate: false })).data;
  }

  async start() {
    this.form = this.fb.group({
      email: ['', [Validators.required,Validators.email]],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required]
    });
    this.requirements = await this.auth.registerRequirements();
    this.getCountries();
  }

  validateLength(event) {
    this.changeColorMaxCharacters = event.target.value.length >= 8;
  }

  validateEmailField() {
    this.form.patchValue({
      email: this.form.get('email').value.toLowerCase()
    });

    this.hasSubmitted = false;
    this.messagesValidationInputs['email'] = '';
    // validamos que el correo tenga formato válido con un regex
    const regex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    if (!regex.test(this.form.controls.email.value)) {
      this.messagesValidationInputs['email'] = 'El correo no tiene un formato válido';
    }

    // Validamos que el email no esté vacío
    if (this.form.controls.email.value === '' || this.form.controls.email.value === undefined) {
      this.messagesValidationInputs['email'] = 'Este campo es requerido';
    }
  }

  validateConfirmPasswordField() {
    this.hasSubmitted = false;
    this.messagesValidationInputs['password_confirmation'] = '';

    // validamos que las contraseñas coincidan
    if (this.form.controls.password.value !== this.form.controls.password_confirmation.value ) {
      this.messagesValidationInputs['password_confirmation'] = 'Las contraseñas no coinciden';
    }

    // validamos que la contraseña no esté vacía
    if (this.form.controls.password_confirmation.value === '' || this.form.controls.password_confirmation.value === undefined) {
      this.messagesValidationInputs['password_confirmation'] = 'Este campo es requerido';
    }
  }

  async register() {
    try {
      // validamos que todos los campos sean válidos
      this.validateEmailField();
      this.validateConfirmPasswordField();
      this.hasSubmitted = true;
      // si alguno de los campos no es válido, retornamos
      if (Object.values(this.messagesValidationInputs).includes('Este campo es requerido')||
        Object.values(this.messagesValidationInputs).includes('El correo no tiene un formato válido')||
        Object.values(this.messagesValidationInputs).includes('Las contraseñas no coinciden')||
        Object.values(this.messagesValidationInputs).includes('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un símbolo.')) {
        return;
      }

      await this.auth.register(Object.assign(this.registerData , {...this.form.value}) );
    }
    catch (e) {
      if (e.status == 422 || e.status == 409 ) {
        // obtenemos la propiedad del objeto que tiene el error
        const property = Object.keys(e.error.errors)[0];

        // si la propiedad es email, mostramos el mensaje de error correspondiente
        if (property == 'email') {
          this.messagesValidationInputs['email'] = e.error.errors[property][0];
        } else if (property == 'password') {
          this.messagesValidationInputs['password'] = e.error.errors[property][0];
        } else {
          this.messagesValidationInputs['password_confirmation'] = e.error.errors[property][0];
        }
        // this.validateForm.validate(e);
      }
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

  openWindowsWhatsApp() {
    window.open('https://api.whatsapp.com/send/?phone=50224272000&text&type=phone_number&app_absent=0', '_blank');
  }
}
