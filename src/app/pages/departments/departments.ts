import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Departments</h2>
          <p class="subtitle">Manage company departments and team structures</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      <div class="inline-loader" *ngIf="isDeptsLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Loading departments...</span>
      </div>

      <div class="dept-grid" *ngIf="!isDeptsLoading">
        <mat-card class="dept-card" *ngFor="let d of departments">
          <mat-card-header>
            <div class="dept-icon"><mat-icon>business</mat-icon></div>
            <div>
              <mat-card-title>{{d.name}}</mat-card-title>
              <mat-card-subtitle>{{d.employee_count || 0}} Active Employees</mat-card-subtitle>
            </div>
            <span class="spacer"></span>
            <mat-chip [class]="'chip-' + d.status">{{d.status | uppercase}}</mat-chip>
          </mat-card-header>

          <mat-card-content class="dept-content">
            <p>{{d.description || 'No description provided.'}}</p>
          </mat-card-content>

          <mat-card-actions align="end" *ngIf="authService.isAdminOrHR()">
            <button mat-button color="primary" (click)="openModal(d)"><mat-icon>edit</mat-icon> Edit</button>
            <button mat-button color="warn" (click)="toggleStatus(d)"><mat-icon>power_settings_new</mat-icon> Toggle</button>
          </mat-card-actions>
        </mat-card>

        <div class="no-records-card" *ngIf="departments.length === 0">
          <mat-icon class="empty-icon">business_center</mat-icon>
          <p>No departments available. Click "Add Department" to create one.</p>
        </div>
      </div>

      <!-- Add/Edit Department Modal renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{editingDept ? 'Edit Department' : 'Add Department'}}</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="deptForm" (ngSubmit)="save()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Department Name *</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Engineering">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Department purpose..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="deptForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 20px; color: #555; }
    .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .dept-card { border-radius: 12px !important; }
    .dept-icon { width: 44px; height: 44px; border-radius: 10px; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
    .dept-content { padding-top: 12px; font-size: 0.875rem; color: #555; }

    .no-records-card { grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: 12px; color: #777; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 12px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Departments implements OnInit {
  authService = inject(AuthService);
  private deptService = inject(DepartmentService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  departments: any[] = [];
  isDeptsLoading = false;
  isSubmitting = false;
  showModal = false;
  editingDept: any = null;

  deptForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isDeptsLoading = true;
    this.cdr.markForCheck();
    this.deptService.getAll().pipe(
      finalize(() => {
        this.isDeptsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.departments = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.departments.length === 0) this.departments = [];
        this.cdr.markForCheck();
      }
    });
  }

  openModal(dept?: any): void {
    this.editingDept = dept || null;
    if (dept) this.deptForm.patchValue(dept); else this.deptForm.reset();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.deptForm.reset();
    this.cdr.markForCheck();
  }

  save(): void {
    if (this.deptForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    const val = this.deptForm.value;

    const req$ = this.editingDept
      ? this.deptService.update(this.editingDept.id, val)
      : this.deptService.create(val);

    req$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Department saved successfully', 'Close', { duration: 3000 });
        this.closeModal();
        this.loadData();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  toggleStatus(dept: any): void {
    this.deptService.toggleStatus(dept.id).subscribe({
      next: (res: any) => {
        dept.status = res?.data?.status || (dept.status === 'active' ? 'inactive' : 'active');
        this.snackBar.open(`Status updated`, 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
