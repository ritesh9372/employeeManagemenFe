import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>User Profile</h2>
          <p class="subtitle">View and update your personal details and security credentials</p>
        </div>
      </div>

      <div class="inline-loader" *ngIf="isProfileLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading profile details...</span>
      </div>

      <!-- Forms ALWAYS render immediately -->
      <div class="profile-grid">
        <mat-card class="profile-card">
          <mat-card-header>
            <div class="profile-avatar">{{userInitials}}</div>
            <div>
              <mat-card-title>{{userProfile?.user?.name || authService.currentUser?.name || 'User'}}</mat-card-title>
              <mat-card-subtitle>
                {{userProfile?.user?.email || authService.currentUser?.email}} • {{(userProfile?.user?.role || authService.currentUser?.role) | uppercase}}
                <div *ngIf="userProfile?.employee" style="margin-top: 4px; font-size: 0.85rem; color: #555;">
                  <span *ngIf="userProfile?.employee?.department_name">Dept: <strong>{{userProfile.employee.department_name}}</strong></span>
                  <span *ngIf="userProfile?.employee?.designation_name"> | Position: <strong>{{userProfile.employee.designation_name}}</strong></span>
                  <span *ngIf="userProfile?.employee?.manager_name"> | Manager: <strong>{{userProfile.employee.manager_name}}</strong></span>
                </div>
              </mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content class="profile-form-body">
            <h3>Personal Information</h3>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address">
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isSubmittingProfile">
                <mat-spinner diameter="18" *ngIf="isSubmittingProfile"></mat-spinner>
                <span *ngIf="!isSubmittingProfile">Save Profile</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="profile-card">
          <mat-card-content class="profile-form-body">
            <h3>Security & Password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Password</mat-label>
                <input matInput type="password" formControlName="current_password">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Password</mat-label>
                <input matInput type="password" formControlName="new_password">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm New Password</mat-label>
                <input matInput type="password" formControlName="confirm_password">
              </mat-form-field>

              <button mat-raised-button color="accent" type="submit" [disabled]="passwordForm.invalid || isSubmittingPassword">
                <mat-spinner diameter="18" *ngIf="isSubmittingPassword"></mat-spinner>
                <span *ngIf="!isSubmittingPassword">Update Password</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; margin-bottom: 16px; border-radius: 8px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
    .profile-card { border-radius: 12px !important; }
    .profile-avatar { width: 56px; height: 56px; border-radius: 50%; background: #1a237e; color: white; font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .profile-form-body { padding-top: 16px; }
    .profile-form-body h3 { font-size: 1.1rem; font-weight: 600; color: #1a237e; margin-bottom: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  userProfile: any = null;
  isProfileLoading = false;
  isSubmittingProfile = false;
  isSubmittingPassword = false;

  profileForm: FormGroup = this.fb.group({
    name: [this.authService.currentUser?.name || '', Validators.required],
    phone: [''],
    address: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  });

  get userInitials(): string {
    const name = this.userProfile?.user?.name || this.authService.currentUser?.name || 'User';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isProfileLoading = true;
    this.cdr.markForCheck();
    this.profileService.getMe().pipe(
      finalize(() => {
        this.isProfileLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userProfile = res.data;
          this.profileForm.patchValue({
            name: res.data.user?.name || this.authService.currentUser?.name,
            phone: res.data.employee?.phone || '',
            address: res.data.employee?.address || ''
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSubmittingProfile = true;
    this.cdr.markForCheck();

    this.profileService.updateProfile(this.profileForm.value).pipe(
      finalize(() => {
        this.isSubmittingProfile = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Profile updated successfully!', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.isSubmittingPassword = true;
    this.cdr.markForCheck();

    this.profileService.changePassword(this.passwordForm.value).pipe(
      finalize(() => {
        this.isSubmittingPassword = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Password changed successfully!', 'Close', { duration: 3000 });
        this.passwordForm.reset();
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
