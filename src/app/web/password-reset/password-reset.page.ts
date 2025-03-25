/* eslint-disable max-len */
import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import {fadeInUp400ms} from 'src/app/@vex/animations/fade-in-up.animation';
import {AuthService} from 'src/app/core/auth/auth.service';
import {ValidatableFormComponent} from 'src/app/core/components/validatable-form/validatable-form.component';
import {Requirements} from 'src/app/data-handlers/api-data/api-data.service';
import {ListService} from '../services/list/list.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {StorageService} from "../../core/storage/storage.service";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class PasswordResetPage implements OnInit, OnDestroy {
  @ViewChild(ValidatableFormComponent) validateForm: ValidatableFormComponent;
  form: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  inputType = 'password';
  visible = false;
  hasSubmitted = false;

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;
  requirements: Requirements;
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

  get passwordFormControl() {
    return this.form.get('password') as FormControl;
  }

  get confirmPasswordFormControl() {
    return this.form.get('password_confirmation') as FormControl;
  }

  constructor(private router: Router,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              private matSnackbar: MatSnackBar,
              private auth: AuthService,
              private listService: ListService,
              private activatedRoute: ActivatedRoute,
              private storage: StorageService
  ) {
  }

  ngOnInit() {
    this.initializeForm();
    this.start();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      email: [new URLSearchParams(window.location.search).get('email'), Validators.required],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      token: [this.activatedRoute.snapshot.params.token, Validators.required],
    });
    this.form.controls.email.disable();
  }

  async start() {
    this.requirements = await this.auth.confirmPasswordReset(null, true);
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(()=> this.hasSubmitted = false);
  }

  async send() {
    this.hasSubmitted=true;
    this.form.controls.email.enable();
    try {
      this.validateForm.clear();
      await this.auth.confirmPasswordReset(this.form.value);
      this.matSnackbar.open('Hemos cambiado su clave correctamente', null, {
        duration: 10000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      await this.storage.clear();
      this.router.navigateByUrl('/web/login');
    } catch (e) {
      let msg = 'Ocurrió un error';

      if (e.status === 422) {
        msg = 'El formulario tiene errores';
        this.validateForm.validate(e);
      }
      this.matSnackbar.open(msg, null, {
        duration: 10000,
        panelClass: 'bg-danger',
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }
}
