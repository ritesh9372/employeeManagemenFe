import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="header">
          <div class="logo-circle">
            <mat-icon>badge</mat-icon>
          </div>
          <h2>Employee Management</h2>
          <p>Sign in to your corporate portal</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="name@company.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="full-width submit-btn" [disabled]="loginForm.invalid || loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>

        <div class="demo-section">
          <p class="demo-title">Quick Demo Login:</p>
          <div class="demo-buttons">
            <button mat-stroked-button (click)="fillDemo('admin@company.com', 'Admin@123')">Admin</button>
            <button mat-stroked-button (click)="fillDemo('hr@company.com', 'Hr@123')">HR</button>
            <button mat-stroked-button (click)="fillDemo('manager@company.com', 'Manager@123')">Manager</button>
            <button mat-stroked-button (click)="fillDemo('john.smith@company.com', 'Emp@123')">Employee</button>
          </div>
        </div>

        <div class="card-footer">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); padding: 16px; }
    .login-card { width: 100%; max-width: 440px; border-radius: 16px !important; padding: 32px 24px 24px !important; box-shadow: 0 12px 32px rgba(0,0,0,0.2) !important; }
    .header { text-align: center; margin-bottom: 28px; }
    .logo-circle { width: 64px; height: 64px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .logo-circle mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .header h2 { font-size: 1.5rem; font-weight: 700; color: #1a237e; margin: 0 0 4px; }
    .header p { font-size: 0.875rem; color: #666; margin: 0; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { height: 48px; font-size: 1rem; font-weight: 600; border-radius: 8px; margin-top: 8px; }
    .demo-section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
    .demo-title { font-size: 0.8rem; color: #666; font-weight: 500; margin-bottom: 8px; }
    .demo-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
    .demo-buttons button { flex: 1; min-width: 80px; font-size: 0.75rem; border-color: #c5cae9; color: #1a237e; }
    .card-footer { text-align: center; margin-top: 20px; font-size: 0.875rem; color: #666; }
    .card-footer a { color: #1a237e; text-decoration: none; font-weight: 600; }
  `]
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);

  hidePassword = true;
  loading = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  fillDemo(email: string, pw: string): void {
    this.loginForm.patchValue({ email, password: pw });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.snackBar.open(`Welcome back, ${res.user.name}!`, 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Login failed. Check your credentials.';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
