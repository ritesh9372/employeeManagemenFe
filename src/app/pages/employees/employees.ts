import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { DesignationService } from '../../services/designation.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Employee Directory</h2>
          <p class="subtitle">Manage staff records, departments, and positions</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>

      <!-- Filter Controls ALWAYS render immediately -->
      <mat-card class="filter-card">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Search Name/Email/Code</mat-label>
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadEmployees()" placeholder="Search employee...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="selectedDept" (selectionChange)="loadEmployees()">
              <mat-option value="">All Departments</mat-option>
              <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadEmployees()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>refresh</mat-icon> Reset
          </button>
        </div>
      </mat-card>

      <!-- Table Card with inline loading indicator -->
      <mat-card class="table-card">
        <div class="inline-loader" *ngIf="isEmployeesLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading employee directory...</span>
        </div>

        <table mat-table [dataSource]="employees" class="full-width-table">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let emp">
              <div class="emp-cell">
                <div class="emp-avatar">{{getInitials(emp.first_name, emp.last_name)}}</div>
                <div>
                  <strong class="emp-name">{{emp.first_name}} {{emp.last_name}}</strong>
                  <div class="emp-email">{{emp.email}}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let emp"><strong>{{emp.employee_code}}</strong></td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let emp">{{emp.department_name || 'N/A'}}</td>
          </ng-container>

          <ng-container matColumnDef="designation">
            <th mat-header-cell *matHeaderCellDef>Designation</th>
            <td mat-cell *matCellDef="let emp">{{emp.designation_name || 'N/A'}}</td>
          </ng-container>

          <ng-container matColumnDef="manager">
            <th mat-header-cell *matHeaderCellDef>Manager</th>
            <td mat-cell *matCellDef="let emp">{{emp.manager_name || 'N/A'}}</td>
          </ng-container>

          <ng-container matColumnDef="joining">
            <th mat-header-cell *matHeaderCellDef>Joining Date</th>
            <td mat-cell *matCellDef="let emp">{{emp.joining_date | date:'mediumDate'}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let emp">
              <mat-chip [class]="'chip-' + emp.status">{{emp.status | uppercase}}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let emp" class="action-cell">
              <button mat-icon-button color="primary" (click)="viewDetail(emp)" matTooltip="View Details">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="openEditModal(emp)" *ngIf="authService.isAdminOrHR()" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="toggleStatus(emp)" *ngIf="authService.isAdminOrHR()" matTooltip="Toggle Status">
                <mat-icon>{{emp.status === 'active' ? 'block' : 'check_circle'}}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="no-records-msg" *ngIf="!isEmployeesLoading && employees.length === 0">
          <mat-icon>group_off</mat-icon>
          <p>No employees found matching the filters.</p>
        </div>
      </mat-card>

      <!-- Add/Edit Employee Form Modal renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{editingEmp ? 'Edit Employee Record' : 'Add New Employee'}}</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="empForm" (ngSubmit)="saveEmployee()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>First Name *</mat-label>
                <input matInput formControlName="first_name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Last Name *</mat-label>
                <input matInput formControlName="last_name">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Email Address *</mat-label>
                <input matInput type="email" formControlName="email">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Department</mat-label>
                <mat-select formControlName="department_id" (selectionChange)="onDeptChange($event.value)">
                  <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Designation</mat-label>
                <mat-select formControlName="designation_id">
                  <mat-option *ngFor="let des of designations" [value]="des.id">{{des.name}}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row" *ngIf="authService.isAdminOrHR()">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Assigned Manager</mat-label>
                <mat-select formControlName="manager_id">
                  <mat-option [value]="null">-- None / Unassigned --</mat-option>
                  <mat-option *ngFor="let m of managers" [value]="m.id">
                    {{m.name || (m.first_name + ' ' + m.last_name)}} ({{m.department_name || 'Manager'}})
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Joining Date</mat-label>
                <input matInput type="date" formControlName="joining_date">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Monthly Salary (₹)</mat-label>
                <input matInput type="number" formControlName="salary">
              </mat-form-field>
            </div>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="empForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Save Employee</span>
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
    .filter-card { border-radius: 12px !important; margin-bottom: 20px; padding: 16px; }
    .filter-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 160px; }
    .filter-row ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width-table { width: 100%; }
    .emp-cell { display: flex; align-items: center; gap: 12px; }
    .emp-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1a237e; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
    .emp-name { font-size: 0.9rem; color: #1a237e; }
    .emp-email { font-size: 0.75rem; color: #666; }

    .no-records-msg { text-align: center; padding: 32px; color: #777; }
    .no-records-msg mat-icon { font-size: 36px; height: 36px; width: 36px; color: #ccc; margin-bottom: 8px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .form-row { display: flex; gap: 12px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `]
})
export class Employees implements OnInit {
  authService = inject(AuthService);
  private empService = inject(EmployeeService);
  private deptService = inject(DepartmentService);
  private desigService = inject(DesignationService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  employees: any[] = [];
  departments: any[] = [];
  designations: any[] = [];
  managers: any[] = [];

  isEmployeesLoading = false;
  isSubmitting = false;

  searchQuery = '';
  selectedDept = '';
  selectedStatus = '';

  displayedColumns = ['employee', 'code', 'department', 'designation', 'joining', 'status', 'actions'];

  showModal = false;
  editingEmp: any = null;

  empForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department_id: [null],
    designation_id: [null],
    manager_id: [null],
    joining_date: [''],
    salary: [0]
  });

  ngOnInit(): void {
    if (this.authService.isAdminOrHR()) {
      this.displayedColumns = ['employee', 'code', 'department', 'designation', 'manager', 'joining', 'status', 'actions'];
    } else {
      this.displayedColumns = ['employee', 'code', 'department', 'designation', 'joining', 'status', 'actions'];
    }
    this.loadDepartments();
    this.loadManagers();
    this.loadEmployees();
  }

  getInitials(first?: string, last?: string): string {
    const f = first ? first[0] : 'E';
    const l = last ? last[0] : '';
    return (f + l).toUpperCase();
  }

  loadDepartments(): void {
    this.deptService.getAll().subscribe({
      next: (res: any) => {
        this.departments = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      }
    });
  }

  loadManagers(): void {
    if (this.authService.isAdminOrHR()) {
      this.empService.getManagers().subscribe({
        next: (res: any) => {
          this.managers = res?.data || (Array.isArray(res) ? res : []);
          this.cdr.markForCheck();
        }
      });
    }
  }

  onDeptChange(deptId: number): void {
    if (deptId) {
      this.desigService.getAll(deptId).subscribe({
        next: (res: any) => {
          this.designations = res?.data || (Array.isArray(res) ? res : []);
          this.cdr.markForCheck();
        }
      });
    }
  }

  loadEmployees(): void {
    this.isEmployeesLoading = true;
    this.cdr.markForCheck();
    const filters: any = {};
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedDept) filters.department_id = this.selectedDept;
    if (this.selectedStatus) filters.status = this.selectedStatus;

    this.empService.getAll(filters).pipe(
      finalize(() => {
        this.isEmployeesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.employees = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.employees = [];
        this.cdr.markForCheck();
      }
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDept = '';
    this.selectedStatus = '';
    this.loadEmployees();
  }

  openAddModal(): void {
    this.editingEmp = null;
    this.empForm.reset();
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(emp: any): void {
    this.editingEmp = emp;
    this.empForm.patchValue({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department_id: emp.department_id || null,
      designation_id: emp.designation_id || null,
      manager_id: emp.manager_id || null,
      joining_date: emp.joining_date ? emp.joining_date.substring(0, 10) : '',
      salary: emp.salary || 0
    });
    if (emp.department_id) this.onDeptChange(emp.department_id);
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  saveEmployee(): void {
    if (this.empForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();
    const val = this.empForm.value;

    const req$ = this.editingEmp
      ? this.empService.update(this.editingEmp.id, val)
      : this.empService.create(val);

    req$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Employee record saved successfully', 'Close', { duration: 3500 });
        this.closeModal();
        this.loadEmployees();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  toggleStatus(emp: any): void {
    this.empService.toggleStatus(emp.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(`Employee status updated`, 'Close', { duration: 3000 });
        this.loadEmployees();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  viewDetail(emp: any): void {
    this.snackBar.open(`Employee: ${emp.first_name} ${emp.last_name} (${emp.employee_code}) - ${emp.email}`, 'Close', { duration: 5000 });
  }
}
