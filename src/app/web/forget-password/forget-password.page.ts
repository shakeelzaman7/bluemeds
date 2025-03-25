import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import { fadeInUp400ms } from 'src/app/@vex/animations/fade-in-up.animation';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { ListService } from '../services/list/list.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class ForgetPasswordPage implements OnInit {

  form: FormGroup;

  inputType = 'password';
  visible = false;

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  constructor(private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private auth: AuthService,
    private listService: ListService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required]
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

  async send() {
    try {
      await this.auth.resetPassword(this.form.value)        
    }
    catch (e) {
      
    }
    let msg = "Hemos enviado un enlace a " + this.form.get("email").value + " para restablecer tu contraseña.";

      this.snackbar.open(msg, null, {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'        
      });

      this.router.navigateByUrl("/web/login")
  }

}
