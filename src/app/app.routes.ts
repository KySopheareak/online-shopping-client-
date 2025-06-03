import { Routes } from '@angular/router';
import { NavMenuComponent } from './routes/nav-menu/nav-menu.component';
import { AuthGuard } from '../services/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: NavMenuComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./routes/list/routes/list.component').then(
            (c) => c.ListComponent
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./routes/login/login.component').then((c) => c.LoginComponent),
  },
];
