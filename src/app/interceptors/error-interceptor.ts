import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request details provided.';
      } else if (error.status === 401) {
        errorMessage = error.error?.message || 'Your session has expired. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = error.error?.message || 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = error.error?.message || 'The requested resource or endpoint was not found.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Action conflict: Data already exists or request already completed.';
      } else if (error.status >= 500) {
        errorMessage = error.error?.message || 'Server error encountered. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      return throwError(() => error);
    })
  );
};
