import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Task Board</h2>
          <p class="subtitle">Assign, track, and manage employee tasks and deliverables</p>
        </div>
        <button mat-raised-button color="primary" (click)="openModal()" *ngIf="!authService.isEmployee()">
          <mat-icon>add_task</mat-icon> Create Task
        </button>
      </div>

      <!-- Main Task Cards Grid with granular inline loading -->
      <div class="inline-loader" *ngIf="isTasksLoading">
        <mat-spinner diameter="36"></mat-spinner>
        <span>Loading tasks...</span>
      </div>

      <div class="task-grid" *ngIf="!isTasksLoading">
        <mat-card class="task-card" *ngFor="let t of tasks">
          <mat-card-header>
            <div class="priority-indicator" [class]="'bg-' + t.priority"></div>
            <div>
              <mat-card-title>{{t.title}}</mat-card-title>
              <mat-card-subtitle>Assigned to: {{t.assigned_name || t.employee_name || 'Unassigned'}}</mat-card-subtitle>
            </div>
            <span class="spacer"></span>
            <mat-chip [class]="'chip-' + t.priority">{{t.priority | uppercase}}</mat-chip>
          </mat-card-header>

          <mat-card-content class="task-desc">
            <p>{{t.description || 'No description provided.'}}</p>
            <div class="task-meta">
              <span><mat-icon class="meta-icon">event</mat-icon> Due: {{t.due_date ? (t.due_date | date:'mediumDate') : 'No due date'}}</span>
              <span *ngIf="t.department_name"><mat-icon class="meta-icon">business</mat-icon> {{t.department_name}}</span>
            </div>
          </mat-card-content>

          <mat-card-actions class="task-actions">
            <mat-form-field appearance="outline" class="status-select">
              <mat-label>Status</mat-label>
              <mat-select [value]="t.status" (selectionChange)="updateStatus(t, $event.value)">
                <mat-option value="todo">To Do</mat-option>
                <mat-option value="in_progress">In Progress</mat-option>
                <mat-option value="review">Review</mat-option>
                <mat-option value="completed">Completed</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-actions>
        </mat-card>

        <div class="no-records-card" *ngIf="tasks.length === 0">
          <mat-icon class="empty-icon">assignment_late</mat-icon>
          <p>No tasks found. Click "Create Task" to assign a new task.</p>
        </div>
      </div>

      <!-- Create Task Modal Form renders immediately -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Create New Task</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>
          
          <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Task Title *</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Update API Documentation">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Provide task requirements..."></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Assign To Employee</mat-label>
                <mat-select formControlName="assigned_to">
                  <mat-option *ngIf="isEmployeesLoading" disabled>Loading employees...</mat-option>
                  <mat-option *ngFor="let emp of employees" [value]="emp.id">
                    {{emp.first_name}} {{emp.last_name}} ({{emp.employee_code || 'EMP'}})
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Department</mat-label>
                <mat-select formControlName="department_id">
                  <mat-option *ngIf="isDepartmentsLoading" disabled>Loading departments...</mat-option>
                  <mat-option *ngFor="let dept of departments" [value]="dept.id">
                    {{dept.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="low">Low</mat-option>
                  <mat-option value="medium">Medium</mat-option>
                  <mat-option value="high">High</mat-option>
                  <mat-option value="critical">Critical</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Initial Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="todo">To Do</mat-option>
                  <mat-option value="in_progress">In Progress</mat-option>
                  <mat-option value="review">Review</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Start Date</mat-label>
                <input matInput type="date" formControlName="start_date">
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Due Date</mat-label>
                <input matInput type="date" formControlName="due_date">
              </mat-form-field>
            </div>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="taskForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Create Task</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 24px; color: #555; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .task-card { border-radius: 12px !important; position: relative; overflow: hidden; }
    .priority-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
    .task-desc { padding-top: 12px; font-size: 0.875rem; color: #555; }
    .task-meta { margin-top: 12px; font-size: 0.75rem; color: #888; display: flex; gap: 16px; }
    .meta-icon { font-size: 14px; width: 14px; height: 14px; vertical-align: middle; }
    .task-actions { padding: 8px 16px 16px; }
    .status-select { width: 100%; }

    .no-records-card { grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: 12px; color: #777; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 12px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 92%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
  `]
})
export class Tasks implements OnInit {
  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private empService = inject(EmployeeService);
  private deptService = inject(DepartmentService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  tasks: any[] = [];
  employees: any[] = [];
  departments: any[] = [];

  isTasksLoading = false;
  isEmployeesLoading = false;
  isDepartmentsLoading = false;
  isSubmitting = false;
  showModal = false;

  taskForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    assigned_to: [null],
    department_id: [null],
    priority: ['medium'],
    status: ['todo'],
    start_date: [''],
    due_date: ['']
  });

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
    this.loadDepartments();
  }

  loadTasks(): void {
    this.isTasksLoading = true;
    this.cdr.markForCheck();
    this.taskService.getAll().pipe(
      finalize(() => {
        this.isTasksLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.tasks = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.tasks.length === 0) {
          this.tasks = [];
        }
        this.cdr.markForCheck();
      }
    });
  }

  loadEmployees(): void {
    this.isEmployeesLoading = true;
    this.cdr.markForCheck();
    this.empService.getAll().pipe(
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
        this.cdr.markForCheck();
      }
    });
  }

  loadDepartments(): void {
    this.isDepartmentsLoading = true;
    this.cdr.markForCheck();
    this.deptService.getAll().pipe(
      finalize(() => {
        this.isDepartmentsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.departments = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    if (this.employees.length === 0) this.loadEmployees();
    if (this.departments.length === 0) this.loadDepartments();
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.taskForm.reset({ priority: 'medium', status: 'todo' });
    this.cdr.markForCheck();
  }

  saveTask(): void {
    if (this.taskForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.taskService.create(this.taskForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Task created successfully!', 'Close', { duration: 3500 });
        this.closeModal();
        this.loadTasks();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  updateStatus(t: any, newStatus: string): void {
    this.taskService.update(t.id, { status: newStatus }).subscribe({
      next: (res: any) => {
        t.status = newStatus;
        this.snackBar.open('Task status updated', 'Close', { duration: 2000 });
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
