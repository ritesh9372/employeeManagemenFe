import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule,
    MatTabsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p class="subtitle">Generate exportable audit and management reports</p>
        </div>
      </div>

      <mat-card class="report-card">
        <div class="inline-loader" *ngIf="isReportsLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Fetching report data...</span>
        </div>

        <mat-tab-group (selectedTabChange)="onTabChange($event.index)">
          <mat-tab label="Employee Directory">
            <div class="tab-body">
              <table mat-table [dataSource]="reportData" class="full-width-table">
                <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{r.employee_code}}</td></ng-container>
                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{r.name}}</td></ng-container>
                <ng-container matColumnDef="department"><th mat-header-cell *matHeaderCellDef>Department</th><td mat-cell *matCellDef="let r">{{r.department}}</td></ng-container>
                <ng-container matColumnDef="designation"><th mat-header-cell *matHeaderCellDef>Designation</th><td mat-cell *matCellDef="let r">{{r.designation}}</td></ng-container>
                <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{r.status}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="['code','name','department','designation','status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['code','name','department','designation','status'];"></tr>
              </table>

              <div class="no-records-msg" *ngIf="!isReportsLoading && reportData.length === 0">
                <p>No records found for Employee Directory report.</p>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Attendance Summary">
            <div class="tab-body">
              <table mat-table [dataSource]="reportData" class="full-width-table">
                <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{r.date | date:'mediumDate'}}</td></ng-container>
                <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let r">{{r.employee_name}}</td></ng-container>
                <ng-container matColumnDef="in"><th mat-header-cell *matHeaderCellDef>Check In</th><td mat-cell *matCellDef="let r">{{r.check_in}}</td></ng-container>
                <ng-container matColumnDef="out"><th mat-header-cell *matHeaderCellDef>Check Out</th><td mat-cell *matCellDef="let r">{{r.check_out}}</td></ng-container>
                <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{r.status}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="['date','employee','in','out','status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['date','employee','in','out','status'];"></tr>
              </table>

              <div class="no-records-msg" *ngIf="!isReportsLoading && reportData.length === 0">
                <p>No records found for Attendance Summary report.</p>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Leave Applications">
            <div class="tab-body">
              <table mat-table [dataSource]="reportData" class="full-width-table">
                <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let r">{{r.employee_name}}</td></ng-container>
                <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let r">{{r.leave_type}}</td></ng-container>
                <ng-container matColumnDef="days"><th mat-header-cell *matHeaderCellDef>Days</th><td mat-cell *matCellDef="let r">{{r.days}}</td></ng-container>
                <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{r.status}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="['employee','type','days','status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['employee','type','days','status'];"></tr>
              </table>

              <div class="no-records-msg" *ngIf="!isReportsLoading && reportData.length === 0">
                <p>No records found for Leave Applications report.</p>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Payroll Summary">
            <div class="tab-body">
              <table mat-table [dataSource]="reportData" class="full-width-table">
                <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let r">{{r.employee_name}}</td></ng-container>
                <ng-container matColumnDef="period"><th mat-header-cell *matHeaderCellDef>Period</th><td mat-cell *matCellDef="let r">{{r.month}}/{{r.year}}</td></ng-container>
                <ng-container matColumnDef="gross"><th mat-header-cell *matHeaderCellDef>Gross</th><td mat-cell *matCellDef="let r">₹{{(r.gross_salary || 0) | number}}</td></ng-container>
                <ng-container matColumnDef="net"><th mat-header-cell *matHeaderCellDef>Net</th><td mat-cell *matCellDef="let r">₹{{(r.net_salary || 0) | number}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="['employee','period','gross','net']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['employee','period','gross','net'];"></tr>
              </table>

              <div class="no-records-msg" *ngIf="!isReportsLoading && reportData.length === 0">
                <p>No records found for Payroll Summary report.</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; }
    .report-card { border-radius: 12px !important; overflow: hidden; }
    .tab-body { padding: 16px; overflow-x: auto; }
    .full-width-table { width: 100%; }
    .no-records-msg { text-align: center; padding: 24px; color: #777; }
  `]
})
export class Reports implements OnInit {
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  reportData: any[] = [];
  isReportsLoading = false;
  activeTabIndex = 0;

  ngOnInit(): void {
    this.fetchReport(0);
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
    this.fetchReport(index);
  }

  fetchReport(idx: number): void {
    this.isReportsLoading = true;
    this.cdr.markForCheck();
    const obs = idx === 0 ? this.reportService.getEmployeeReport()
              : idx === 1 ? this.reportService.getAttendanceReport()
              : idx === 2 ? this.reportService.getLeaveReport()
              : this.reportService.getPayrollReport();

    obs.pipe(
      finalize(() => {
        this.isReportsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.reportData = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.reportData.length === 0) this.reportData = [];
        this.cdr.markForCheck();
      }
    });
  }
}
