import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { DesignationService } from '../../services/designation.service';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Designations</h2>
          <p class="subtitle">Manage job titles and hierarchy levels</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>add</mat-icon> Add Designation
        </button>
      </div>

      <mat-card class="table-card">
        <div class="inline-loader" *ngIf="isDesignationsLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading designations...</span>
        </div>

        <table mat-table [dataSource]="designations" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Designation Name</th>
            <td mat-cell *matCellDef="let d"><strong>{{d.name}}</strong></td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let d">{{d.department_name || 'All Departments'}}</td>
          </ng-container>

          <ng-container matColumnDef="level">
            <th mat-header-cell *matHeaderCellDef>Level</th>
            <td mat-cell *matCellDef="let d">Level {{d.level || 1}}</td>
          </ng-container>

          <ng-container matColumnDef="count">
            <th mat-header-cell *matHeaderCellDef>Employees</th>
            <td mat-cell *matCellDef="let d">{{d.employee_count || 0}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let d"><mat-chip [class]="'chip-' + d.status">{{d.status | uppercase}}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let d" class="action-cell">
              <ng-container *ngIf="authService.isAdminOrHR()">
                <button mat-icon-button color="primary" (click)="openModal(d)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="toggleStatus(d)"><mat-icon>power_settings_new</mat-icon></button>
              </ng-container>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="no-records-msg" *ngIf="!isDesignationsLoading && designations.length === 0">
          <mat-icon>badge</mat-icon>
          <p>No designations found.</p>
        </div>
      </mat-card>

      <!-- Modal Form renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{editingDesig ? 'Edit Designation' : 'Add Designation'}}</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="desigForm" (ngSubmit)="save()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Designation Name *</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Senior Software Engineer">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department_id">
                <mat-option [value]="null">All Departments</mat-option>
                <mat-option *ngFor="let dept of departments" [value]="dept.id">{{dept.name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Level (1-5)</mat-label>
              <input matInput type="number" formControlName="level">
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="desigForm.invalid || isSubmitting">
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
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; }
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width-table { width: 100%; }

    .no-records-msg { text-align: center; padding: 32px; color: #777; }
    .no-records-msg mat-icon { font-size: 36px; height: 36px; width: 36px; color: #ccc; margin-bottom: 8px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Designations implements OnInit {
  authService = inject(AuthService);
  private desigService = inject(DesignationService);
  private deptService = inject(DepartmentService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  designations: any[] = [];
  departments: any[] = [];
  isDesignationsLoading = false;
  isSubmitting = false;

  showModal = false;
  editingDesig: any = null;
  displayedColumns = ['name', 'department', 'level', 'count', 'status', 'actions'];

  desigForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    department_id: [null],
    level: [1]
  });

  ngOnInit(): void {
    this.loadDepartments();
    this.loadData();
  }

  loadDepartments(): void {
    this.deptService.getAll().subscribe({
      next: (res: any) => {
        this.departments = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      }
    });
  }

  loadData(): void {
    this.isDesignationsLoading = true;
    this.cdr.markForCheck();
    this.desigService.getAll().pipe(
      finalize(() => {
        this.isDesignationsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.designations = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.designations.length === 0) this.designations = [];
        this.cdr.markForCheck();
      }
    });
  }

  openModal(d?: any): void {
    this.editingDesig = d || null;
    if (d) this.desigForm.patchValue(d); else this.desigForm.reset({ level: 1 });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.desigForm.reset({ level: 1 });
    this.cdr.markForCheck();
  }

  save(): void {
    if (this.desigForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    const val = this.desigForm.value;

    const req$ = this.editingDesig
      ? this.desigService.update(this.editingDesig.id, val)
      : this.desigService.create(val);

    req$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Designation saved', 'Close', { duration: 3000 });
        this.closeModal();
        this.loadData();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  toggleStatus(d: any): void {
    this.desigService.toggleStatus(d.id).subscribe({
      next: (res: any) => {
        d.status = res?.data?.status || (d.status === 'active' ? 'inactive' : 'active');
        this.snackBar.open(`Status updated`, 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
