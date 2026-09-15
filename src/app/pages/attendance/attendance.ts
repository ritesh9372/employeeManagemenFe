import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../service/auth';
import { MOCK_ATTENDANCE } from '../../mock-data';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatPaginatorModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Attendance Log</h2>
          <p class="subtitle">Monitor daily check-ins, check-outs, work modes, and working hours</p>
        </div>
        <div class="actions" *ngIf="authService.isEmployee()">
          <mat-form-field appearance="outline" class="w-mode-select" *ngIf="!todayAtt?.check_in">
            <mat-select [(ngModel)]="selectedWorkMode">
              <mat-option value="Office"><mat-icon inline>business</mat-icon> Office</mat-option>
              <mat-option value="Work From Home"><mat-icon inline>home</mat-icon> WFH</mat-option>
              <mat-option value="Hybrid"><mat-icon inline>alt_route</mat-icon> Hybrid</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="doCheckIn()" [disabled]="todayAtt?.check_in || isSubmitting">
            <mat-icon>login</mat-icon> Check In
          </button>
          <button mat-raised-button color="accent" (click)="doCheckOut()" [disabled]="!todayAtt?.check_in || todayAtt?.check_out || isSubmitting">
            <mat-icon>logout</mat-icon> Check Out
          </button>
        </div>
      </div>

      <!-- Filter Controls ALWAYS render immediately -->
      <mat-card class="filter-card">
        <div class="filter-grid">
          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Search Employee</mat-label>
            <input matInput [(ngModel)]="searchTerm" placeholder="Search by name or code..." (keyup.enter)="loadAttendance()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>From Date</mat-label>
            <input matInput type="date" [(ngModel)]="fromDate" (change)="loadAttendance()">
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>To Date</mat-label>
            <input matInput type="date" [(ngModel)]="toDate" (change)="loadAttendance()">
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadAttendance()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="present">Present</mat-option>
              <mat-option value="late">Late</mat-option>
              <mat-option value="absent">Absent</mat-option>
              <mat-option value="leave">Leave</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Work Mode</mat-label>
            <mat-select [(ngModel)]="selectedWorkModeFilter" (selectionChange)="loadAttendance()">
              <mat-option value="">All Work Modes</mat-option>
              <mat-option value="Office">Office</mat-option>
              <mat-option value="Work From Home">Work From Home</mat-option>
              <mat-option value="Hybrid">Hybrid</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="filter-actions">
            <button mat-flat-button color="primary" (click)="loadAttendance()">
              <mat-icon>filter_list</mat-icon> Apply
            </button>
            <button mat-stroked-button (click)="resetFilters()">
              <mat-icon>refresh</mat-icon> Reset
            </button>
          </div>
        </div>
      </mat-card>

      <!-- Table View Card with inline loading indicator -->
      <mat-card class="table-card">
        <div class="inline-loader" *ngIf="isAttendanceLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading attendance logs...</span>
        </div>

        <div class="table-responsive">
          <table mat-table [dataSource]="attendanceRecords" class="full-width-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a"><strong>{{a.date | date:'mediumDate'}}</strong></td>
            </ng-container>

            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let a">
                <div class="emp-cell">
                  <span class="emp-name">{{a.employee_name || 'Self'}}</span>
                  <span class="emp-sub">{{a.employee_code || 'N/A'}} • {{a.department_name || 'Engineering'}}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="work_mode">
              <th mat-header-cell *matHeaderCellDef>Work Mode</th>
              <td mat-cell *matCellDef="let a">
                <span class="work-mode-badge" [ngClass]="getWorkModeClass(a.work_mode)">
                  {{a.work_mode || 'Office'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="check_in">
              <th mat-header-cell *matHeaderCellDef>Check In</th>
              <td mat-cell *matCellDef="let a">{{a.check_in || '--:--'}}</td>
            </ng-container>

            <ng-container matColumnDef="check_out">
              <th mat-header-cell *matHeaderCellDef>Check Out</th>
              <td mat-cell *matCellDef="let a">{{a.check_out || '--:--'}}</td>
            </ng-container>

            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef>Working Hours</th>
              <td mat-cell *matCellDef="let a">
                <span class="hours-val">{{a.formatted_working_hours || (a.working_hours ? a.working_hours + ' hrs' : '--')}}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [class]="'chip-' + a.status">{{a.status | uppercase}}</mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="no-records-msg" *ngIf="!isAttendanceLoading && attendanceRecords.length === 0">
            <mat-icon>info</mat-icon>
            <p>No attendance records match your filter criteria.</p>
          </div>

          <mat-paginator
            [length]="totalRecords"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; }
    .actions { display: flex; gap: 12px; align-items: center; }
    .w-mode-select { max-width: 140px; margin-bottom: -1.25em; }
    
    .filter-card { border-radius: 12px !important; margin-bottom: 20px; padding: 16px; }
    .filter-grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .filter-item { flex: 1; min-width: 150px; }
    .filter-item ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .filter-actions { display: flex; gap: 8px; }

    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width-table { width: 100%; }
    .emp-cell { display: flex; flex-direction: column; }
    .emp-name { font-weight: 600; color: #333; }
    .emp-sub { font-size: 0.75rem; color: #777; }
    .hours-val { font-weight: 600; color: #1a237e; }

    .work-mode-badge { display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 0.75rem; font-weight: 600; }
    .wm-office { background-color: #e8eaf6; color: #1a237e; }
    .wm-wfh { background-color: #e8f5e9; color: #2e7d32; }
    .wm-hybrid { background-color: #fff3e0; color: #e65100; }

    .no-records-msg { text-align: center; padding: 32px; color: #777; }
    .no-records-msg mat-icon { font-size: 36px; height: 36px; width: 36px; margin-bottom: 8px; color: #aaa; }
  `]
})
export class Attendance implements OnInit {
  authService = inject(AuthService);
  private attService = inject(AttendanceService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  attendanceRecords: any[] = [];
  todayAtt: any = null;
  isAttendanceLoading = false;
  isSubmitting = false;

  searchTerm = '';
  fromDate = '';
  toDate = '';
  selectedStatus = '';
  selectedWorkModeFilter = '';
  selectedWorkMode: 'Office' | 'Work From Home' | 'Hybrid' = 'Office';

  pageIndex = 0;
  pageSize = 10;
  totalRecords = 0;

  displayedColumns = ['date', 'employee', 'work_mode', 'check_in', 'check_out', 'hours', 'status'];

  ngOnInit(): void {
    this.loadTodayAttendance();
    this.loadAttendance();
  }

  loadTodayAttendance(): void {
    this.attService.getToday().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.todayAtt = res.data;
          if (res.data.work_mode) {
            this.selectedWorkMode = res.data.work_mode;
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  loadAttendance(): void {
    this.isAttendanceLoading = true;
    this.cdr.markForCheck();
    const filters: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.fromDate) filters.from_date = this.fromDate;
    if (this.toDate) filters.to_date = this.toDate;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedWorkModeFilter) filters.work_mode = this.selectedWorkModeFilter;

    this.attService.getAll(filters).pipe(
      finalize(() => {
        this.isAttendanceLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.attendanceRecords = res.data || [];
          this.totalRecords = res.pagination?.total || res.data?.length || 0;
        } else if (Array.isArray(res)) {
          this.attendanceRecords = res;
          this.totalRecords = res.length;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.attendanceRecords.length === 0) {
          this.attendanceRecords = MOCK_ATTENDANCE;
          this.totalRecords = MOCK_ATTENDANCE.length;
        }
        this.cdr.markForCheck();
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.fromDate = '';
    this.toDate = '';
    this.selectedStatus = '';
    this.selectedWorkModeFilter = '';
    this.pageIndex = 0;
    this.loadAttendance();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAttendance();
  }

  getWorkModeClass(mode: string): string {
    switch (mode) {
      case 'Work From Home': return 'wm-wfh';
      case 'Hybrid': return 'wm-hybrid';
      default: return 'wm-office';
    }
  }

  doCheckIn(): void {
    this.isSubmitting = true;
    this.cdr.markForCheck();
    this.attService.checkIn(this.selectedWorkMode).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Checked in successfully!', 'Close', { duration: 3500 });
        this.loadTodayAttendance();
        this.loadAttendance();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  doCheckOut(): void {
    this.isSubmitting = true;
    this.cdr.markForCheck();
    this.attService.checkOut().pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Checked out successfully!', 'Close', { duration: 3500 });
        this.loadTodayAttendance();
        this.loadAttendance();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
