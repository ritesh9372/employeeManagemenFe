import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../service/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const allowedRoles: string[] = route.data?.['roles'] || [];

  if (!authService.isLoggedIn) return router.createUrlTree(['/login']);
  if (allowedRoles.length === 0) return true;
  if (authService.hasRole(...allowedRoles)) return true;

  snackBar.open("You don't have permission to access this page.", 'Close', {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  });

  return router.createUrlTree(['/dashboard']);
};
