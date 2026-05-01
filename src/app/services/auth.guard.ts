import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../model/user.model';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authService: AuthService = inject(AuthService),
  router: Router = inject(Router)
) => {
  const authState = authService.authState();
  
  // If still loading, allow navigation (don't block while checking session)
  if (authState.loading) {
    return true;
  }
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authService: AuthService = inject(AuthService),
    router: Router = inject(Router)
  ) => {
    const authState = authService.authState();
    
    // If still loading, allow navigation (don't block while checking session)
    if (authState.loading) {
      return true;
    }
    
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (!authService.hasRole(...allowedRoles)) {
      router.navigate(['/profile']);
      return false;
    }

    return true;
  };
};

