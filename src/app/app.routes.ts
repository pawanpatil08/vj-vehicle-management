import { Routes } from '@angular/router';
import { LoginComponent } from './pages/components/login/login';
import { RegisterComponent } from './pages/components/register/register';
import { authGuard, roleGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/components/login/login').then((m) => m.LoginComponent) },
  {
    path: 'register',
    loadComponent: () => import('./pages/components/register/register').then((m) => m.RegisterComponent),
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/components/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/components/search/serach').then((m) => m.SearchComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/components/admin/admin').then((m) => m.AdminComponent),
    canActivate: [roleGuard(['admin', 'datamanagement'])],
  },
  { path: '**', redirectTo: '/search' },
];

