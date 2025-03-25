import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CustomLayoutComponent } from './custom-layout/custom-layout.component';

const routes: Routes = [
  {
    path:'',
    redirectTo: environment.initialRoute,
    pathMatch: 'full' 
  },
  {
    component: CustomLayoutComponent,    
    path: 'web',
    loadChildren: () => import('./web/web.module').then( m => m.WebPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
    //preloadingStrategy: PreloadAllModules, 
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'corrected',
    anchorScrolling: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
