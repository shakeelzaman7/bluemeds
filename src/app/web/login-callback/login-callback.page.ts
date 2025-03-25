import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.page.html',
})

export class LoginCallbackPage implements OnInit {
  
  constructor(
    private router: Router,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) { }

  async ngOnInit() {
    const token = this.router.parseUrl(this.router.url).queryParams['auth_token'];
    const newAccount = this.router.parseUrl(this.router.url).queryParams['new_account'];

    // taken validation
    try {
      await this.auth.manageAuthToken(token, newAccount);
    } catch (e) {
      this.router.navigateByUrl(`/web/login`);
    }
  }
}
