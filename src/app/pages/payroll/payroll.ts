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
import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <!-- Section Header ALWAYS renders immediately -->
      <div class="section-header no-print">
        <div>
          <h2>Payroll Management</h2>
          <p class="subtitle">Salary processing, allowances, deductions, and payslips</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateModal()" *ngIf="authService.isAdminOrHR()">
          <mat-icon>add</mat-icon> Generate Payroll
        </button>
      </div>

      <mat-card class="table-card no-print">
        <div class="inline-loader" *ngIf="isPayrollLoading">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading payroll records...</span>
        </div>

        <table mat-table [dataSource]="payrolls" class="full-width-table">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let p"><strong>{{p.employee_name || 'Self'}}</strong> ({{p.employee_code || ''}})</td>
          </ng-container>

          <ng-container matColumnDef="period">
            <th mat-header-cell *matHeaderCellDef>Month/Year</th>
            <td mat-cell *matCellDef="let p">{{getMonthName(p.month)}} {{p.year}}</td>
          </ng-container>

          <ng-container matColumnDef="gross">
            <th mat-header-cell *matHeaderCellDef>Gross Salary</th>
            <td mat-cell *matCellDef="let p">₹{{(p.gross_salary || 0) | number}}</td>
          </ng-container>

          <ng-container matColumnDef="net">
            <th mat-header-cell *matHeaderCellDef>Net Salary</th>
            <td mat-cell *matCellDef="let p"><strong>₹{{(p.net_salary || 0) | number}}</strong></td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p"><mat-chip [class]="'chip-' + p.status">{{p.status | uppercase}}</mat-chip></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p" class="action-cell">
              <button mat-stroked-button color="primary" (click)="process(p)" *ngIf="p.status === 'draft' && authService.isAdminOrHR()">Process</button>
              <button mat-stroked-button color="accent" (click)="markPaid(p)" *ngIf="p.status === 'processed' && authService.isAdminOrHR()">Mark Paid</button>
              <button mat-raised-button color="primary" (click)="viewPayslip(p)" matTooltip="View & Print Salary Slip">
                <mat-icon>receipt</mat-icon> Salary Slip
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="no-records-msg" *ngIf="!isPayrollLoading && payrolls.length === 0">
          <mat-icon>payments</mat-icon>
          <p>No payroll records found.</p>
        </div>
      </mat-card>

      <!-- Generate Payroll Modal Form -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Create Payroll Entry</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="payrollForm" (ngSubmit)="savePayroll()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Employee *</mat-label>
              <mat-select formControlName="employee_id">
                <mat-option *ngIf="isEmployeesLoading" disabled>Loading employees...</mat-option>
                <mat-option *ngFor="let emp of employees" [value]="emp.id">{{emp.first_name}} {{emp.last_name}} ({{emp.employee_code}})</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Month (1-12) *</mat-label>
                <input matInput type="number" formControlName="month">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Year *</mat-label>
                <input matInput type="number" formControlName="year">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Basic (₹)</mat-label>
                <input matInput type="number" formControlName="basic">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>HRA (₹)</mat-label>
                <input matInput type="number" formControlName="hra">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Allowances (₹)</mat-label>
                <input matInput type="number" formControlName="allowances">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Tax (₹)</mat-label>
                <input matInput type="number" formControlName="tax">
              </mat-form-field>
            </div>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="payrollForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Create Entry</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Detailed Salary Slip / Payslip Modal View -->
      <div class="modal-backdrop" *ngIf="showPayslipModal">
        <div class="modal-box payslip-modal-box">
          <div class="modal-header no-print">
            <h3>Salary Slip Preview</h3>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="printPayslip()"><mat-icon>print</mat-icon> Print / Save PDF</button>
              <button mat-icon-button (click)="closePayslipModal()"><mat-icon>close</mat-icon></button>
            </div>
          </div>

          <div class="payslip-document" id="printable-payslip">
            <div class="payslip-company-bar">
              <div class="company-brand">
                <div class="brand-icon"><mat-icon>business</mat-icon></div>
                <div>
                  <h2 class="company-name">EMS GLOBAL SOLUTIONS INC.</h2>
                  <p class="company-sub">Enterprise Employee Management System • HR & Payroll Division</p>
                </div>
              </div>
              <div class="payslip-badge" [class]="'badge-' + selectedPayslip?.status">
                {{(selectedPayslip?.status || 'PAID') | uppercase}}
              </div>
            </div>

            <div class="payslip-title-banner">
              SALARY SLIP FOR {{getMonthName(selectedPayslip?.month) | uppercase}} {{selectedPayslip?.year}}
            </div>

            <div class="emp-details-grid">
              <div class="detail-item">
                <span class="detail-label">Employee Name:</span>
                <span class="detail-value"><strong>{{selectedPayslip?.employee_name || 'Employee Record'}}</strong></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee Code:</span>
                <span class="detail-value"><strong>{{selectedPayslip?.employee_code || 'EMP-' + selectedPayslip?.employee_id}}</strong></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">{{selectedPayslip?.department_name || 'Engineering & IT'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Designation:</span>
                <span class="detail-value">{{selectedPayslip?.designation_name || 'Senior Developer'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pay Period:</span>
                <span class="detail-value">{{getMonthName(selectedPayslip?.month)}} {{selectedPayslip?.year}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Mode:</span>
                <span class="detail-value">Direct Bank Transfer (NEFT/RTGS)</span>
              </div>
            </div>

            <table class="payslip-calc-table">
              <thead>
                <tr>
                  <th>EARNINGS</th>
                  <th class="text-right">AMOUNT (₹)</th>
                  <th>DEDUCTIONS</th>
                  <th class="text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td class="text-right">₹{{(+selectedPayslip?.basic_salary || +selectedPayslip?.basic || 40000) | number}}</td>
                  <td>Tax Deducted at Source (TDS)</td>
                  <td class="text-right">₹{{(+selectedPayslip?.tax || 5000) | number}}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td class="text-right">₹{{(+selectedPayslip?.hra || 15000) | number}}</td>
                  <td>Provident Fund (PF)</td>
                  <td class="text-right">₹{{(+selectedPayslip?.pf || 1800) | number}}</td>
                </tr>
                <tr>
                  <td>Special & Flexible Allowances</td>
                  <td class="text-right">₹{{(+selectedPayslip?.allowances || 10000) | number}}</td>
                  <td>Other Deductions / Advance</td>
                  <td class="text-right">₹{{(+selectedPayslip?.deductions || 0) | number}}</td>
                </tr>
                <tr class="totals-row">
                  <td><strong>Gross Earnings</strong></td>
                  <td class="text-right"><strong>₹{{(+selectedPayslip?.gross_salary || 65000) | number}}</strong></td>
                  <td><strong>Total Deductions</strong></td>
                  <td class="text-right"><strong>₹{{((+selectedPayslip?.tax || 5000) + (+selectedPayslip?.pf || 1800) + (+selectedPayslip?.deductions || 0)) | number}}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="net-payable-box">
              <div>
                <div class="net-title">NET PAYABLE SALARY</div>
                <div class="net-words">Amount in words: {{getAmountInWords(+selectedPayslip?.net_salary || 58200)}}</div>
              </div>
              <div class="net-figure">₹{{(+selectedPayslip?.net_salary || 58200) | number}}</div>
            </div>

            <div class="payslip-footer-note">
              <p>Note: This is a system-generated salary slip generated via EMS Portal and does not require a physical signature.</p>
            </div>
          </div>

          <div class="modal-actions no-print margin-top">
            <button mat-button (click)="closePayslipModal()">Close</button>
            <button mat-raised-button color="primary" (click)="printPayslip()"><mat-icon>print</mat-icon> Print / Download PDF</button>
          </div>
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
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .payslip-modal-box { max-width: 720px !important; width: 95%; max-height: 92vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .text-right { text-align: right; }
    .margin-top { margin-top: 16px; }

    /* Payslip Document Styles */
    .payslip-document { background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; color: #333; }
    .payslip-company-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a237e; padding-bottom: 16px; }
    .company-brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 44px; height: 44px; border-radius: 10px; background: #1a237e; color: white; display: flex; align-items: center; justify-content: center; }
    .company-name { font-size: 1.25rem; font-weight: 800; color: #1a237e; margin: 0; letter-spacing: 0.5px; }
    .company-sub { font-size: 0.75rem; color: #666; margin: 2px 0 0; }
    .payslip-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
    .badge-draft { background: #fff3e0; color: #e65100; border-color: #ffe0b2; }
    .badge-processed { background: #e3f2fd; color: #1565c0; border-color: #bbdefb; }

    .payslip-title-banner { background: #f4f5fa; text-align: center; font-weight: 700; padding: 10px; border-radius: 8px; margin: 16px 0; color: #1a237e; letter-spacing: 1px; font-size: 0.95rem; }

    .emp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; background: #fafafa; padding: 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 20px; border: 1px solid #f0f0f0; }
    .detail-item { display: flex; gap: 8px; }
    .detail-label { color: #666; min-width: 110px; }
    .detail-value { color: #222; }

    .payslip-calc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 20px; }
    .payslip-calc-table th { background: #1a237e; color: white; padding: 10px 12px; font-weight: 600; text-align: left; }
    .payslip-calc-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .payslip-calc-table tr.totals-row td { background: #f5f5f5; border-top: 2px solid #ddd; font-size: 0.9rem; }

    .net-payable-box { background: linear-gradient(135deg, #1a237e 0%, #303f9f 100%); color: white; padding: 16px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .net-title { font-size: 0.75rem; opacity: 0.85; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .net-words { font-size: 0.8rem; margin-top: 4px; opacity: 0.95; font-style: italic; }
    .net-figure { font-size: 1.6rem; font-weight: 800; }

    .payslip-footer-note { font-size: 0.75rem; color: #888; text-align: center; margin-top: 16px; border-top: 1px dashed #ddd; padding-top: 12px; }

    @media print {
      body * { visibility: hidden; }
      #printable-payslip, #printable-payslip * { visibility: visible; }
      #printable-payslip { position: fixed; left: 0; top: 0; width: 100%; padding: 30px; box-sizing: border-box; }
      .no-print { display: none !important; }
    }
  `]
})
export class Payroll implements OnInit {
  authService = inject(AuthService);
  private payrollService = inject(PayrollService);
  private empService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  payrolls: any[] = [];
  employees: any[] = [];
  isPayrollLoading = false;
  isEmployeesLoading = false;
  isSubmitting = false;

  showModal = false;
  showPayslipModal = false;
  selectedPayslip: any = null;

  displayedColumns = ['employee', 'period', 'gross', 'net', 'status', 'actions'];

  payrollForm: FormGroup = this.fb.group({
    employee_id: [null, Validators.required],
    month: [new Date().getMonth() + 1, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    basic: [40000],
    hra: [15000],
    allowances: [10000],
    tax: [5000]
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadPayrolls();
  }

  getMonthName(m?: number): string {
    if (!m) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[(m - 1) % 12] || 'Month';
  }

  getAmountInWords(num: number): string {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    return `Rupees ${num.toLocaleString('en-IN')} Only`;
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

  loadPayrolls(): void {
    this.isPayrollLoading = true;
    this.cdr.markForCheck();
    this.payrollService.getAll().pipe(
      finalize(() => {
        this.isPayrollLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.payrolls = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.payrolls.length === 0) this.payrolls = [];
        this.cdr.markForCheck();
      }
    });
  }

  openCreateModal(): void {
    this.showModal = true;
    if (this.employees.length === 0) this.loadEmployees();
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  savePayroll(): void {
    if (this.payrollForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.payrollService.create(this.payrollForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Payroll entry generated!', 'Close', { duration: 3000 });
        this.closeModal();
        this.loadPayrolls();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  process(p: any): void {
    this.payrollService.process(p.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Payroll processed', 'Close', { duration: 3000 });
        this.loadPayrolls();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  markPaid(p: any): void {
    this.payrollService.markPaid(p.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Salary marked as paid!', 'Close', { duration: 3000 });
        this.loadPayrolls();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  viewPayslip(p: any): void {
    this.selectedPayslip = p;
    this.showPayslipModal = true;
    this.cdr.markForCheck();
  }

  closePayslipModal(): void {
    this.showPayslipModal = false;
    this.selectedPayslip = null;
    this.cdr.markForCheck();
  }

  printPayslip(): void {
    window.print();
  }
}
