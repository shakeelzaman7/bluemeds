import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/auth/auth-guard.service';
import { WebGuard } from './web-guard';
import { NavigationGuard } from './navigation-guard';

import { WebPage } from './web.page';
import {NoLoginTokenAuthGuard} from '../core/auth/no-login-token-guard.service';
import { WizardGuard } from '../core/auth/wizard-guard.service';

const routes: Routes = [
  {
    path:'',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: WebPage,
    canActivate: [WebGuard],
    children: [
      {
        path: 'search',
        loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
      },
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
      },
      {
        path: 'list',
        canActivate: [AuthGuard],
        loadChildren: () => import('./list/list.module').then( m => m.ListPageModule)
      },
      {
        path: 'help',
        loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
      },
      {
        path: 'wizard-register',
        canActivate: [AuthGuard],
        loadChildren: () => import('./wizard-register/wizard-register.module').then( m => m.WizardRegisterPageModule)
      },
      {
        path: 'subscriptions-success',
        canActivate: [AuthGuard],
        loadChildren: () => import('./sub-success/sub-success.module').then( m => m.SubSuccessPageModule)
      },
      {
        path: 'success-subscription', // vista de suscripción exitosa pero sin login
        canActivate: [NoLoginTokenAuthGuard],
        loadChildren: () => import('./success-subscription/success-subscription.module').then( m => m.SuccessSubscriptionPageModule)
      },
      {
        path: 'subscriptions-failure',
        canActivate: [AuthGuard],
        loadChildren: () => import('./sub-failure/sub-failure.module').then( m => m.SubFailurePageModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./forget-password/forget-password.module').then( m => m.ForgetPasswordPageModule)
      },
      {
        path: 'password-reset',
        loadChildren: () => import('./password-reset/password-reset.module').then( m => m.PasswordResetPageModule)
      },
      {
        path: 'terms-and-conditions',
        loadChildren: () => import('./terms/terms.module').then( m => m.TermsPageModule)
      },
      // No referral advertising will be used for the time being.
      /* {
        path: 'referral-program-terms',
        loadChildren: () => import('./referral-program-terms/referral-program-terms.module').then( m => m.ReferralProgramTermsPageModule)
      }, */
      {
        path: 'budget',
        loadChildren: () => import('./budget/budget.module').then( m => m.BudgetPageModule)
      },
      {
        path: 'welcome',
        canActivate: [AuthGuard],
        loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule)
      },
      {
        path: 'first-steps',
        canActivate: [AuthGuard],
        loadChildren: () => import('./first-steps/first-steps.module').then( m => m.FirstStepsModule)
      },
      {
        path: 'profile',
        canActivate: [AuthGuard, WizardGuard],
        canDeactivate: [NavigationGuard],
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'delivery-address',
        canActivate: [AuthGuard, WizardGuard],
        canDeactivate: [NavigationGuard],
        loadChildren: () => import('./delivery-address/delivery-address.module').then( m => m.DeliveryAddressPageModule)
      },
      {
        path: 'billing-data',
        canActivate: [AuthGuard, WizardGuard],
        canDeactivate: [NavigationGuard],
        loadChildren: () => import('./billing/billing.module').then( m => m.BillingPageModule)
      },
      {
        path: 'payment-page',
        canActivate: [AuthGuard, WizardGuard],
        canDeactivate: [NavigationGuard],
        loadChildren: () => import('./payment-page/payment-page.module').then( m => m.PaymentPagePageModule)
      },
      {
        path: 'add-payment-method', // vista sin login para agregar método de pago (link compartido)
        canActivate: [NoLoginTokenAuthGuard],
        loadChildren: () => import('./add-payment-method/add-payment-method.module').then( m => m.AddPaymentMethodPageModule)
      },
      {
        path: 'add-payment-and-confirm', // vista para agregar método de pago y completar la suscripción (comunmente compartido desde la one page en backoffice)
        canActivate: [NoLoginTokenAuthGuard],
        loadChildren: () => import('./confirm-subscription/confirm-subscription.module').then( m => m.ConfirmSubscriptionPageModule)
      },
      {
        path: 'login-callback',
        loadChildren: () => import('./login-callback/login-callback.module').then( m => m.LoginCallbackPageModule)
      }
      //{ path: '**', component: PageNotFoundComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class WebPageRoutingModule {}
