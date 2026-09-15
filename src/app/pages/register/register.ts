import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <div class="header">
          <h2>Create Account</h2>
          <p>Register as a new system user</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="John Doe">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="name@company.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="employee">Employee</mat-option>
              <mat-option value="manager">Manager</mat-option>
              <mat-option value="hr">HR Specialist</mat-option>
              <mat-option value="admin">Administrator</mat-option>
            </mat-select>
            <mat-icon matPrefix>admin_panel_settings</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Must be at least 6 characters</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="full-width submit-btn" [disabled]="registerForm.invalid || loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Create Account</span>
          </button>
        </form>

        <div class="card-footer">
          <p>Already registered? <a routerLink="/login">Sign in</a></p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); padding: 16px; }
    .register-card { width: 100%; max-width: 440px; border-radius: 16px !important; padding: 32px 24px 24px !important; box-shadow: 0 12px 32px rgba(0,0,0,0.2) !important; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h2 { font-size: 1.5rem; font-weight: 700; color: #1a237e; margin: 0 0 4px; }
    .header p { font-size: 0.875rem; color: #666; margin: 0; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { height: 48px; font-size: 1rem; font-weight: 600; border-radius: 8px; margin-top: 8px; }
    .card-footer { text-align: center; margin-top: 20px; font-size: 0.875rem; color: #666; }
    .card-footer a { color: #1a237e; text-decoration: none; font-weight: 600; }
  `]
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  loading = false;

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['employee', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Registration successful! Please sign in.', 'OK', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Registration failed.';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
