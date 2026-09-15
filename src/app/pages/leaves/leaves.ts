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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { LeaveService } from '../../services/leave.service';
import { PolicyService } from '../../services/policy.service';
import { DepartmentPolicyService } from '../../services/department-policy.service';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { DesignationService } from '../../services/designation.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatChipsModule, MatCheckboxModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],

  template: `
    <div class="page-container">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <h2>Policy-Based Leave & Entitlement Management</h2>
          <p class="subtitle">Configure multi-tiered leave policies, manage entitlements, and track time-off applications</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="accent" (click)="openPolicyModal()" *ngIf="authService.isAdminOrHR()">
            <mat-icon>policy</mat-icon> + Create Leave Policy
          </button>
          <button mat-stroked-button color="primary" (click)="openSingleModal()" *ngIf="authService.isAdminOrHR()">
            <mat-icon>person_add_disabled</mat-icon> Single Employee Override
          </button>
          <button mat-raised-button color="primary" (click)="openApplyModal()">
            <mat-icon>add</mat-icon> Apply for Leave
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button mat-button [class.active-tab]="activeTab === 'balances'" (click)="setTab('balances')">
          <mat-icon>account_balance_wallet</mat-icon> Employee Leave Balances
        </button>
        <button mat-button [class.active-tab]="activeTab === 'policies'" (click)="setTab('policies')" *ngIf="authService.isAdminOrHR()">
          <mat-icon>admin_panel_settings</mat-icon> Leave Policies & Hierarchy
        </button>
        <button mat-button [class.active-tab]="activeTab === 'requests'" (click)="setTab('requests')">
          <mat-icon>event_note</mat-icon> Leave Applications
        </button>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: LEAVE BALANCES                                            -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeTab === 'balances'">
        <!-- My Balance Cards (For Employee / Manager Self) -->
        <div class="balance-grid" *ngIf="myBalances.length > 0">
          <mat-card class="lb-card" *ngFor="let lb of myBalances">
            <mat-card-content>
              <div class="lb-header">
                <span class="lb-name">{{lb.leave_type_name}}</span>
                <span class="lb-year">{{selectedYear}}</span>
              </div>
              <div class="lb-count">{{lb.remaining_days}} <span class="lb-sub">/ {{lb.total_days}} days</span></div>
              <div class="lb-used">Used: <strong>{{lb.used_days}}</strong> days</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Filter Controls (for HR, Admin & Manager) -->
        <mat-card class="filter-card" *ngIf="authService.isAdminOrHR() || authService.isManager()">
          <div class="filter-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Search Employee / Code</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadAllBalances()" placeholder="Search employee name or code...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-160">
              <mat-label>Leave Year</mat-label>
              <mat-select [(ngModel)]="selectedYear" (selectionChange)="onYearOrDeptChange()">
                <mat-option [value]="2025">2025</mat-option>
                <mat-option [value]="2026">2026</mat-option>
                <mat-option [value]="2027">2027</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-200" *ngIf="authService.isAdminOrHR()">
              <mat-label>Department</mat-label>
              <mat-select [(ngModel)]="selectedDept" (selectionChange)="onYearOrDeptChange()">
                <mat-option value="">All Departments</mat-option>
                <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="resetBalanceFilters()">
              <mat-icon>refresh</mat-icon> Reset
            </button>
            <button mat-stroked-button color="accent" (click)="triggerSyncAll()" *ngIf="authService.isAdminOrHR()" matTooltip="Re-evaluate leave balances against active policies">
              <mat-icon>sync</mat-icon> Re-Sync Balances
            </button>
          </div>
        </mat-card>

        <!-- Balance Table Card -->
        <mat-card class="table-card" *ngIf="authService.isAdminOrHR() || authService.isManager()">
          <div class="inline-loader" *ngIf="isBalancesLoading">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Loading employee leave balances for {{selectedYear}}...</span>
          </div>

          <table mat-table [dataSource]="allBalances" class="full-width-table">
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let emp">
                <div>
                  <strong class="emp-name">{{emp.first_name}} {{emp.last_name}}</strong>
                  <div class="emp-email">{{emp.employee_code}} • {{emp.email}}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Dept & Designation</th>
              <td mat-cell *matCellDef="let emp">
                <div>{{emp.department_name || 'N/A'}}</div>
                <div class="emp-email">{{emp.designation_name || 'N/A'}}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="casual">
              <th mat-header-cell *matHeaderCellDef>Casual Leave (CL)</th>
              <td mat-cell *matCellDef="let emp">
                <span class="badge-rem">{{emp.casual?.remaining}} rem</span>
                <span class="badge-sub"> / {{emp.casual?.total}} tot ({{emp.casual?.used}} used)</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="sick">
              <th mat-header-cell *matHeaderCellDef>Sick Leave (SL)</th>
              <td mat-cell *matCellDef="let emp">
                <span class="badge-rem">{{emp.sick?.remaining}} rem</span>
                <span class="badge-sub"> / {{emp.sick?.total}} tot ({{emp.sick?.used}} used)</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="earned">
              <th mat-header-cell *matHeaderCellDef>Earned Leave (EL)</th>
              <td mat-cell *matCellDef="let emp">
                <span class="badge-rem">{{emp.earned?.remaining}} rem</span>
                <span class="badge-sub"> / {{emp.earned?.total}} tot ({{emp.earned?.used}} used)</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="unpaid">
              <th mat-header-cell *matHeaderCellDef>Unpaid Leave</th>
              <td mat-cell *matCellDef="let emp">
                <span class="badge-unpaid">{{emp.unpaid?.used || 0}} used</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let emp">
                <button mat-icon-button color="primary" (click)="openSingleModalForEmp(emp)" *ngIf="authService.isAdminOrHR()" matTooltip="Custom Employee Override">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="balanceDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: balanceDisplayedColumns;"></tr>
          </table>

          <div class="no-records-msg" *ngIf="!isBalancesLoading && allBalances.length === 0">
            <mat-icon>account_balance_wallet</mat-icon>
            <p>No leave balance records found for {{selectedYear}}.</p>
          </div>
        </mat-card>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: LEAVE POLICIES MANAGEMENT (HR & Admin Only)               -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: DEPARTMENT DEFAULT LEAVE POLICIES (HR & Admin Only)        -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeTab === 'policies' && authService.isAdminOrHR()">
        <mat-card class="filter-card">
          <div class="filter-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Search Department Name</mat-label>
              <input matInput [(ngModel)]="policySearchQuery" (keyup.enter)="loadDeptPolicies()" placeholder="Search department...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-160">
              <mat-label>Leave Year</mat-label>
              <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadDeptPolicies()">
                <mat-option [value]="2025">2025</mat-option>
                <mat-option [value]="2026">2026</mat-option>
                <mat-option [value]="2027">2027</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="openDeptPolicyModal()">
              <mat-icon>add</mat-icon> Create Default Policy
            </button>
          </div>
        </mat-card>

        <mat-card class="table-card">
          <div class="inline-loader" *ngIf="isPoliciesLoading">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Loading department leave policies...</span>
          </div>

          <table mat-table [dataSource]="deptPolicies" class="full-width-table">
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let p">
                <strong class="emp-name">{{p.department_name}}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="year">
              <th mat-header-cell *matHeaderCellDef>Leave Year</th>
              <td mat-cell *matCellDef="let p"><strong>{{p.leave_year}}</strong></td>
            </ng-container>

            <ng-container matColumnDef="casual">
              <th mat-header-cell *matHeaderCellDef>Casual Leave</th>
              <td mat-cell *matCellDef="let p"><strong>{{p.casual_days}}</strong> days</td>
            </ng-container>

            <ng-container matColumnDef="sick">
              <th mat-header-cell *matHeaderCellDef>Sick Leave</th>
              <td mat-cell *matCellDef="let p"><strong>{{p.sick_days}}</strong> days</td>
            </ng-container>

            <ng-container matColumnDef="earned">
              <th mat-header-cell *matHeaderCellDef>Earned Leave</th>
              <td mat-cell *matCellDef="let p"><strong>{{p.earned_days}}</strong> days</td>
            </ng-container>

            <ng-container matColumnDef="unpaid">
              <th mat-header-cell *matHeaderCellDef>Unpaid Leave</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class]="p.unpaid_allowed ? 'scope-chip-DEPARTMENT' : 'chip-rejected'">
                  {{p.unpaid_allowed ? 'Allowed' : 'Not Allowed'}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class]="p.is_active ? 'scope-chip-COMPANY' : 'chip-rejected'">
                  {{p.is_active ? 'Active' : 'Inactive'}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button color="primary" (click)="editDeptPolicy(p)" matTooltip="Edit Policy">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deactivateDeptPolicy(p)" [matTooltip]="p.is_active ? 'Deactivate Policy' : 'Activate Policy'">
                  <mat-icon>{{p.is_active ? 'block' : 'check_circle'}}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="deptPolicyDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: deptPolicyDisplayedColumns;"></tr>
          </table>

          <div class="no-records-msg" *ngIf="!isPoliciesLoading && deptPolicies.length === 0">
            <mat-icon>policy</mat-icon>
            <p>No department default leave policies found for {{selectedYear}}.</p>
          </div>
        </mat-card>
      </div>


      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: LEAVE APPLICATIONS & HISTORY                              -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeTab === 'requests'">
        <mat-card class="table-card margin-top">
          <div class="inline-loader" *ngIf="isLeavesLoading">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Loading leave applications...</span>
          </div>

          <table mat-table [dataSource]="leaveRequests" class="full-width-table">
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let l">
                <strong>{{l.employee_name || 'Self'}}</strong>
                <div class="emp-email" *ngIf="l.employee_code">{{l.employee_code}} • {{l.department_name}}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Leave Type</th>
              <td mat-cell *matCellDef="let l">
                <strong>{{l.leave_type_name}}</strong>
                <span class="chip-half" *ngIf="l.is_half_day"> (Half-Day)</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Dates & Duration</th>
              <td mat-cell *matCellDef="let l">
                {{l.start_date | date:'mediumDate'}} - {{l.end_date | date:'mediumDate'}}
                <strong>({{l.days}} days)</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let l">{{l.reason || 'N/A'}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let l">
                <mat-chip [class]="'chip-' + l.status">{{l.status | uppercase}}</mat-chip>
                <div class="approver-info" *ngIf="l.approver_name">By {{l.approver_name}}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let l" class="action-cell">
                <button mat-stroked-button color="primary" (click)="approve(l)" *ngIf="l.status === 'pending' && (authService.isAdminOrHR() || authService.isManager())">
                  Approve
                </button>
                <button mat-stroked-button color="warn" (click)="reject(l)" *ngIf="l.status === 'pending' && (authService.isAdminOrHR() || authService.isManager())">
                  Reject
                </button>
                <button mat-button color="warn" (click)="cancel(l)" *ngIf="(l.status === 'pending' || l.status === 'approved') && !authService.isAdminOrHR()">
                  Cancel
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="requestDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: requestDisplayedColumns;"></tr>
          </table>

          <div class="no-records-msg" *ngIf="!isLeavesLoading && leaveRequests.length === 0">
            <mat-icon>event_available</mat-icon>
            <p>No leave requests found.</p>
          </div>
        </mat-card>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL 1: APPLY FOR LEAVE MODAL                                  -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showApplyModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Apply for Time Off</h3>
            <button mat-icon-button (click)="closeApplyModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="leaveForm" (ngSubmit)="submitLeave()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Leave Type *</mat-label>
              <mat-select formControlName="leave_type_id">
                <mat-option *ngIf="isLeaveTypesLoading" disabled>Loading leave types...</mat-option>
                <mat-option *ngFor="let t of leaveTypes" [value]="t.id">{{t.name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="checkbox-row">
              <mat-checkbox formControlName="is_half_day">Half-Day Leave (0.5 Days)</mat-checkbox>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Start Date *</mat-label>
                <input matInput type="date" formControlName="start_date">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>End Date *</mat-label>
                <input matInput type="date" formControlName="end_date">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason for Leave</mat-label>
              <textarea matInput formControlName="reason" rows="3" placeholder="Provide details..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeApplyModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="leaveForm.invalid || isSubmitting">
                <mat-spinner diameter="18" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">Submit Application</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL 2: CREATE / EDIT DEPARTMENT DEFAULT LEAVE POLICY MODAL      -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showDeptPolicyModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{editingDeptPolicy ? 'Edit Department Leave Policy' : 'Create Default Leave Policy'}}</h3>
            <button mat-icon-button (click)="closeDeptPolicyModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="deptPolicyForm" (ngSubmit)="submitDeptPolicy()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Department *</mat-label>
                <mat-select formControlName="department_id" [disabled]="!!editingDeptPolicy">
                  <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-160">
                <mat-label>Leave Year *</mat-label>
                <mat-select formControlName="leave_year" [disabled]="!!editingDeptPolicy">
                  <mat-option [value]="2025">2025</mat-option>
                  <mat-option [value]="2026">2026</mat-option>
                  <mat-option [value]="2027">2027</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Casual Leave (CL)</mat-label>
                <input matInput type="number" formControlName="casual_days">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Sick Leave (SL)</mat-label>
                <input matInput type="number" formControlName="sick_days">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Earned Leave (EL)</mat-label>
                <input matInput type="number" formControlName="earned_days">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Unpaid Leave</mat-label>
                <mat-select formControlName="unpaid_allowed">
                  <mat-option [value]="1">Allowed</mat-option>
                  <mat-option [value]="0">Not Allowed</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeDeptPolicyModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="deptPolicyForm.invalid || isSubmittingDeptPolicy">
                <mat-spinner diameter="18" *ngIf="isSubmittingDeptPolicy"></mat-spinner>
                <span *ngIf="!isSubmittingDeptPolicy">Save Policy</span>
              </button>
            </div>
          </form>
        </div>
      </div>


      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL 3: SINGLE EMPLOYEE OVERRIDE MODAL                          -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showSingleModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Single Employee Leave Override</h3>
            <button mat-icon-button (click)="closeSingleModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="singleForm" (ngSubmit)="submitSingleAllocation()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Employee *</mat-label>
              <mat-select formControlName="employee_id" (selectionChange)="onEmployeeSelectedInOverride($event.value)">
                <mat-option *ngFor="let emp of allEmployeesList" [value]="emp.id">
                  {{emp.first_name}} {{emp.last_name}} ({{emp.employee_code}}) - {{emp.department_name || 'No Dept'}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Leave Year *</mat-label>
              <mat-select formControlName="year" (selectionChange)="onYearChangeInOverride()">
                <mat-option [value]="2025">2025</mat-option>
                <mat-option [value]="2026">2026</mat-option>
                <mat-option [value]="2027">2027</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Info box showing employee's active designation policy before applying override -->
            <div class="preview-box" *ngIf="currentEmployeePolicyInfo" style="margin-bottom: 16px;">
              <div class="preview-header">
                <mat-icon color="primary">info</mat-icon>
                <strong>Current Active Policy for {{currentEmployeePolicyInfo.employee?.name}}:</strong>
              </div>
              <div class="preview-names" style="margin-top: 6px; line-height: 1.5;">
                <div><strong>Designation:</strong> {{currentEmployeePolicyInfo.employee?.designation_name || 'N/A'}} | <strong>Dept:</strong> {{currentEmployeePolicyInfo.employee?.department_name || 'N/A'}}</div>
                <div><strong>Active Policy:</strong> {{currentEmployeePolicyInfo.current_policy?.policy_name}} <span class="quota-badge" style="margin-left: 4px;">{{currentEmployeePolicyInfo.current_policy?.scope_type}}</span></div>
                <div><strong>Current Entitlement:</strong> CL: <strong>{{currentEmployeePolicyInfo.current_policy?.casual_days}}</strong>d | SL: <strong>{{currentEmployeePolicyInfo.current_policy?.sick_days}}</strong>d | EL: <strong>{{currentEmployeePolicyInfo.current_policy?.earned_days}}</strong>d | Unpaid: <strong>{{currentEmployeePolicyInfo.current_policy?.unpaid_days}}</strong>d</div>
              </div>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Casual Leave (CL) Quota</mat-label>
                <input matInput type="number" formControlName="casual_total">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Sick Leave (SL) Quota</mat-label>
                <input matInput type="number" formControlName="sick_total">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Earned Leave (EL) Quota</mat-label>
                <input matInput type="number" formControlName="earned_total">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Unpaid Leave Quota</mat-label>
                <input matInput type="number" formControlName="unpaid_total">
              </mat-form-field>
            </div>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeSingleModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="singleForm.invalid || isSubmittingSingle">
                <mat-spinner diameter="18" *ngIf="isSubmittingSingle"></mat-spinner>
                <span *ngIf="!isSubmittingSingle">Save Employee Entitlement</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .tab-switcher { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .tab-switcher button { font-weight: 600; color: #555; }
    .active-tab { color: #1a237e !important; border-bottom: 3px solid #1a237e; }

    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 16px; color: #555; background: #fafafa; }
    .balance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .lb-card { border-radius: 12px !important; }
    .lb-header { display: flex; justify-content: space-between; align-items: center; }
    .lb-name { font-size: 0.85rem; font-weight: 600; color: #666; }
    .lb-year { font-size: 0.75rem; background: #e8eaf6; color: #1a237e; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
    .lb-count { font-size: 1.5rem; font-weight: 700; color: #1a237e; margin-top: 6px; }
    .lb-sub { font-size: 0.8rem; font-weight: 400; color: #777; }
    .lb-used { font-size: 0.75rem; color: #888; margin-top: 4px; }

    .filter-card { border-radius: 12px !important; margin-bottom: 16px; padding: 16px; }
    .filter-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 160px; }
    .w-160 { width: 140px; }
    .w-200 { width: 180px; }
    .filter-row ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }

    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width-table { width: 100%; }
    .margin-top { margin-top: 16px; }

    .emp-name { font-size: 0.9rem; color: #1a237e; }
    .emp-email { font-size: 0.75rem; color: #666; }
    .badge-rem { font-weight: 700; color: #2e7d32; }
    .badge-sub { font-size: 0.75rem; color: #666; }
    .badge-unpaid { font-weight: 600; color: #c62828; }
    .chip-half { font-size: 0.75rem; color: #e65100; font-weight: 600; }
    .approver-info { font-size: 0.7rem; color: #777; margin-top: 2px; }

    .scope-chip-COMPANY { background: #e3f2fd; color: #1565c0; font-weight: 700; }
    .scope-chip-DEPARTMENT { background: #e8f5e9; color: #2e7d32; font-weight: 700; }
    .scope-chip-DESIGNATION { background: #fff3e0; color: #ef6c00; font-weight: 700; }
    .scope-chip-DEPARTMENT_DESIGNATION { background: #f3e5f5; color: #7b1fa2; font-weight: 700; }
    .scope-chip-EMPLOYEE { background: #fbe9e7; color: #d84315; font-weight: 700; }

    .quota-badge { display: inline-block; background: #fafafa; border: 1px solid #e0e0e0; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-weight: 600; color: #333; }

    .preview-box { background: #f0f4c3; border: 1px solid #c0ca33; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .preview-header { display: flex; align-items: center; gap: 8px; color: #33691e; }
    .preview-names { font-size: 0.8rem; color: #558b2f; margin-top: 4px; }

    .no-records-msg { text-align: center; padding: 32px; color: #777; }
    .no-records-msg mat-icon { font-size: 36px; height: 36px; width: 36px; color: #ccc; margin-bottom: 8px; }

    .checkbox-row { margin-bottom: 12px; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a237e; }
    .form-row { display: flex; gap: 12px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
  `]
})
export class Leaves implements OnInit {
  authService = inject(AuthService);
  private leaveService = inject(LeaveService);
  private policyService = inject(PolicyService);
  private deptPolicyService = inject(DepartmentPolicyService);
  private empService = inject(EmployeeService);
  private deptService = inject(DepartmentService);
  private desigService = inject(DesignationService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'balances' | 'policies' | 'requests' = 'balances';

  leaveRequests: any[] = [];
  myBalances: any[] = [];
  allBalances: any[] = [];
  policies: any[] = [];
  deptPolicies: any[] = [];
  leaveTypes: any[] = [];
  departments: any[] = [];
  allDesignations: any[] = [];
  filteredDesignations: any[] = [];
  allEmployeesList: any[] = [];

  isLeavesLoading = false;
  isBalancesLoading = false;
  isPoliciesLoading = false;
  isLeaveTypesLoading = false;
  isSubmitting = false;
  isSubmittingSingle = false;
  isSubmittingPolicy = false;
  isSubmittingDeptPolicy = false;

  showApplyModal = false;
  showSingleModal = false;
  showPolicyModal = false;
  showDeptPolicyModal = false;
  editingPolicy: any = null;
  editingDeptPolicy: any = null;

  searchQuery = '';
  policySearchQuery = '';
  policyScopeFilter = '';
  selectedYear = new Date().getFullYear();
  selectedDept = '';

  policyPreview: any = null;
  currentEmployeePolicyInfo: any = null;

  balanceDisplayedColumns = ['employee', 'department', 'casual', 'sick', 'earned', 'unpaid', 'actions'];
  policyDisplayedColumns = ['name', 'scope', 'target', 'year', 'quotas', 'actions'];
  deptPolicyDisplayedColumns = ['department', 'year', 'casual', 'sick', 'earned', 'unpaid', 'status', 'actions'];
  requestDisplayedColumns = ['employee', 'type', 'dates', 'reason', 'status', 'actions'];


  leaveForm: FormGroup = this.fb.group({
    leave_type_id: [null, Validators.required],
    is_half_day: [false],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    reason: ['']
  });

  singleForm: FormGroup = this.fb.group({
    employee_id: [null, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    casual_total: [12, [Validators.required, Validators.min(0)]],
    sick_total: [10, [Validators.required, Validators.min(0)]],
    earned_total: [15, [Validators.required, Validators.min(0)]],
    unpaid_total: [30, [Validators.required, Validators.min(0)]]
  });

  deptPolicyForm: FormGroup = this.fb.group({
    department_id: [null, Validators.required],
    leave_year: [new Date().getFullYear(), Validators.required],
    casual_days: [12, [Validators.required, Validators.min(0)]],
    sick_days: [10, [Validators.required, Validators.min(0)]],
    earned_days: [15, [Validators.required, Validators.min(0)]],
    unpaid_allowed: [1, Validators.required]
  });

  policyForm: FormGroup = this.fb.group({
    policy_name: ['', Validators.required],
    scope_type: ['COMPANY', Validators.required],
    department_id: [null],
    designation_id: [null],
    employee_id: [null],
    leave_year: [new Date().getFullYear(), Validators.required],
    casual_days: [12, [Validators.required, Validators.min(0)]],
    sick_days: [10, [Validators.required, Validators.min(0)]],
    earned_days: [15, [Validators.required, Validators.min(0)]],
    unpaid_days: [30, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  ngOnInit(): void {
    if (!this.authService.isAdminOrHR() && !this.authService.isManager()) {
      this.balanceDisplayedColumns = ['employee', 'casual', 'sick', 'earned', 'unpaid'];
    }

    this.loadDepartments();
    this.loadAllDesignations();
    this.loadLeaveTypes();
    this.loadMyBalances();
    this.loadAllBalances();
    this.loadLeaves();
    if (this.authService.isAdminOrHR()) {
      this.loadDeptPolicies();
    }
  }

  setTab(tab: 'balances' | 'policies' | 'requests'): void {
    this.activeTab = tab;
    if (tab === 'policies') this.loadDeptPolicies();
    this.cdr.markForCheck();
  }


  formatScope(scope: string): string {
    switch (scope) {
      case 'COMPANY': return 'Company Default';
      case 'DEPARTMENT': return 'Department';
      case 'DESIGNATION': return 'Designation';
      case 'DEPARTMENT_DESIGNATION': return 'Dept + Designation';
      case 'EMPLOYEE': return 'Employee Specific';
      default: return scope;
    }
  }

  loadDepartments(): void {
    if (this.authService.isAdminOrHR()) {
      this.deptService.getAll().subscribe({
        next: (res: any) => {
          this.departments = res?.data || (Array.isArray(res) ? res : []);
          this.cdr.markForCheck();
        }
      });
    }
  }

  loadAllDesignations(): void {
    if (this.authService.isAdminOrHR()) {
      this.desigService.getAll().subscribe({
        next: (res: any) => {
          this.allDesignations = res?.data || (Array.isArray(res) ? res : []);
          this.filteredDesignations = [...this.allDesignations];
          this.cdr.markForCheck();
        }
      });
    }
  }

  loadLeaveTypes(): void {
    this.isLeaveTypesLoading = true;
    this.cdr.markForCheck();
    this.leaveService.getTypes().pipe(
      finalize(() => {
        this.isLeaveTypesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.leaveTypes = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      }
    });
  }

  loadMyBalances(): void {
    this.leaveService.getBalance(this.selectedYear).subscribe({
      next: (res: any) => {
        this.myBalances = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      }
    });
  }

  onYearOrDeptChange(): void {
    this.loadAllBalances();
    if (this.authService.isAdminOrHR()) this.loadPolicies();
  }

  loadAllBalances(): void {
    if (!this.authService.isAdminOrHR() && !this.authService.isManager()) return;

    this.isBalancesLoading = true;
    this.cdr.markForCheck();

    const filters: any = { year: this.selectedYear };
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedDept) filters.department_id = this.selectedDept;

    this.leaveService.getAllBalances(filters).pipe(
      finalize(() => {
        this.isBalancesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.allBalances = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.allBalances = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadPolicies(): void {
    if (!this.authService.isAdminOrHR()) return;
    this.isPoliciesLoading = true;
    this.cdr.markForCheck();

    const filters: any = { year: this.selectedYear };
    if (this.policySearchQuery) filters.search = this.policySearchQuery;
    if (this.policyScopeFilter) filters.scope_type = this.policyScopeFilter;

    this.policyService.getPolicies(filters).pipe(
      finalize(() => {
        this.isPoliciesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.policies = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.policies = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadLeaves(): void {
    this.isLeavesLoading = true;
    this.cdr.markForCheck();
    this.leaveService.getAll().pipe(
      finalize(() => {
        this.isLeavesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.leaveRequests = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.leaveRequests = [];
        this.cdr.markForCheck();
      }
    });
  }

  resetBalanceFilters(): void {
    this.searchQuery = '';
    this.selectedDept = '';
    this.selectedYear = new Date().getFullYear();
    this.loadAllBalances();
  }

  triggerSyncAll(): void {
    this.policyService.syncAllBalances(this.selectedYear).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Balances synchronized', 'Close', { duration: 3000 });
        this.loadAllBalances();
        this.loadMyBalances();
      }
    });
  }

  loadDeptPolicies(): void {
    if (!this.authService.isAdminOrHR()) return;
    this.isPoliciesLoading = true;
    this.cdr.markForCheck();

    const filters: any = { year: this.selectedYear };
    if (this.policySearchQuery) filters.search = this.policySearchQuery;

    this.deptPolicyService.getPolicies(filters).pipe(
      finalize(() => {
        this.isPoliciesLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.deptPolicies = res?.data || (Array.isArray(res) ? res : []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.deptPolicies = [];
        this.cdr.markForCheck();
      }
    });
  }

  openDeptPolicyModal(): void {
    this.editingDeptPolicy = null;
    this.deptPolicyForm.reset({
      department_id: null,
      leave_year: this.selectedYear,
      casual_days: 12,
      sick_days: 10,
      earned_days: 15,
      unpaid_allowed: 1
    });
    this.deptPolicyForm.get('department_id')?.enable();
    this.deptPolicyForm.get('leave_year')?.enable();
    this.showDeptPolicyModal = true;
    this.cdr.markForCheck();
  }

  editDeptPolicy(p: any): void {
    this.editingDeptPolicy = p;
    this.deptPolicyForm.patchValue({
      department_id: p.department_id,
      leave_year: p.leave_year,
      casual_days: p.casual_days,
      sick_days: p.sick_days,
      earned_days: p.earned_days,
      unpaid_allowed: p.unpaid_allowed ? 1 : 0
    });
    this.deptPolicyForm.get('department_id')?.disable();
    this.deptPolicyForm.get('leave_year')?.disable();
    this.showDeptPolicyModal = true;
    this.cdr.markForCheck();
  }

  closeDeptPolicyModal(): void {
    this.showDeptPolicyModal = false;
    this.editingDeptPolicy = null;
    this.cdr.markForCheck();
  }

  submitDeptPolicy(): void {
    if (this.deptPolicyForm.invalid) return;
    this.isSubmittingDeptPolicy = true;
    this.cdr.markForCheck();

    const val = this.deptPolicyForm.getRawValue();
    const req$ = this.editingDeptPolicy
      ? this.deptPolicyService.updatePolicy(this.editingDeptPolicy.id, val)
      : this.deptPolicyService.createPolicy(val);

    req$.pipe(
      finalize(() => {
        this.isSubmittingDeptPolicy = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Department leave policy saved successfully!', 'Close', { duration: 3500 });
        this.closeDeptPolicyModal();
        this.loadDeptPolicies();
        this.loadAllBalances();
        this.loadMyBalances();
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Failed to save department leave policy';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
        this.cdr.markForCheck();
      }
    });
  }

  deactivateDeptPolicy(p: any): void {
    const action = p.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} the default leave policy for ${p.department_name}?`)) return;

    this.deptPolicyService.deactivatePolicy(p.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || `Policy ${action}d successfully`, 'Close', { duration: 3000 });
        this.loadDeptPolicies();
        this.loadAllBalances();
        this.loadMyBalances();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to update policy status', 'Close', { duration: 3000 });
      }
    });
  }


  openApplyModal(): void {
    this.leaveForm.reset({ is_half_day: false });
    this.showApplyModal = true;
    if (this.leaveTypes.length === 0) this.loadLeaveTypes();
    this.cdr.markForCheck();
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.leaveForm.reset();
    this.cdr.markForCheck();
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.leaveService.apply(this.leaveForm.value).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave application submitted successfully!', 'Close', { duration: 3500 });
        this.closeApplyModal();
        this.loadLeaves();
        this.loadMyBalances();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to submit leave application';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
        this.cdr.markForCheck();
      }
    });
  }

  // Single Employee Override Modal
  openSingleModal(): void {
    this.currentEmployeePolicyInfo = null;
    this.singleForm.reset({
      year: this.selectedYear,
      casual_total: 12,
      sick_total: 10,
      earned_total: 15,
      unpaid_total: 30
    });
    this.loadEmployeesForSelect();
    this.showSingleModal = true;
    this.cdr.markForCheck();
  }

  openSingleModalForEmp(emp: any): void {
    this.currentEmployeePolicyInfo = null;
    const empId = emp.employee_id || emp.id;
    this.singleForm.patchValue({
      employee_id: empId,
      year: emp.year || this.selectedYear,
      casual_total: emp.casual?.total ?? 12,
      sick_total: emp.sick?.total ?? 10,
      earned_total: emp.earned?.total ?? 15,
      unpaid_total: emp.unpaid?.total ?? 30
    });
    this.loadEmployeesForSelect();
    if (empId) {
      this.onEmployeeSelectedInOverride(empId);
    }
    this.showSingleModal = true;
    this.cdr.markForCheck();
  }

  closeSingleModal(): void {
    this.showSingleModal = false;
    this.currentEmployeePolicyInfo = null;
    this.cdr.markForCheck();
  }

  onEmployeeSelectedInOverride(empId: number): void {
    if (!empId) {
      this.currentEmployeePolicyInfo = null;
      return;
    }
    const year = this.singleForm.value.year || this.selectedYear;
    this.policyService.getEmployeeCurrentPolicy(empId, year).subscribe({
      next: (res: any) => {
        this.currentEmployeePolicyInfo = res?.data || null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.currentEmployeePolicyInfo = null;
        this.cdr.markForCheck();
      }
    });
  }

  onYearChangeInOverride(): void {
    const empId = this.singleForm.value.employee_id;
    if (empId) {
      this.onEmployeeSelectedInOverride(empId);
    }
  }


  loadEmployeesForSelect(): void {
    if (this.allEmployeesList.length === 0 && this.authService.isAdminOrHR()) {
      this.empService.getAll().subscribe({
        next: (res: any) => {
          this.allEmployeesList = res?.data || (Array.isArray(res) ? res : []);
          this.cdr.markForCheck();
        }
      });
    }
  }

  submitSingleAllocation(): void {
    if (this.singleForm.invalid) return;
    this.isSubmittingSingle = true;
    this.cdr.markForCheck();

    this.leaveService.allocateSingleBalance(this.singleForm.value).pipe(
      finalize(() => {
        this.isSubmittingSingle = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Employee leave entitlement updated successfully!', 'Close', { duration: 3500 });
        this.closeSingleModal();
        this.loadAllBalances();
        this.loadMyBalances();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to update leave entitlement', 'Close', { duration: 4000 });
        this.cdr.markForCheck();
      }
    });
  }

  // Policy Modal Logic
  openPolicyModal(): void {
    this.editingPolicy = null;
    this.policyPreview = null;
    this.policyForm.reset({
      scope_type: 'COMPANY',
      leave_year: this.selectedYear,
      casual_days: 12,
      sick_days: 10,
      earned_days: 15,
      unpaid_days: 30
    });
    this.loadEmployeesForSelect();
    this.showPolicyModal = true;
    this.triggerPreview();
    this.cdr.markForCheck();
  }

  editPolicy(p: any): void {
    this.editingPolicy = p;
    this.policyPreview = null;
    this.policyForm.patchValue({
      policy_name: p.policy_name,
      scope_type: p.scope_type,
      department_id: p.department_id,
      designation_id: p.designation_id,
      employee_id: p.employee_id,
      leave_year: p.leave_year,
      casual_days: p.casual_days,
      sick_days: p.sick_days,
      earned_days: p.earned_days,
      unpaid_days: p.unpaid_days,
      description: p.description || ''
    });
    this.loadEmployeesForSelect();
    if (p.department_id) this.onDeptSelectedInPolicy(p.department_id);
    this.showPolicyModal = true;
    this.triggerPreview();
    this.cdr.markForCheck();
  }

  closePolicyModal(): void {
    this.showPolicyModal = false;
    this.editingPolicy = null;
    this.policyPreview = null;
    this.cdr.markForCheck();
  }

  onScopeChange(): void {
    this.policyForm.patchValue({ department_id: null, designation_id: null, employee_id: null });
    this.filteredDesignations = [...this.allDesignations];
    this.triggerPreview();
  }

  onDeptSelectedInPolicy(deptId: number): void {
    if (deptId) {
      this.desigService.getAll(deptId).subscribe({
        next: (res: any) => {
          this.filteredDesignations = res?.data || (Array.isArray(res) ? res : []);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.filteredDesignations = [...this.allDesignations];
    }
    this.triggerPreview();
  }

  triggerPreview(): void {
    const val = this.policyForm.value;
    if (!val.scope_type) return;

    this.policyService.previewPolicy({
      scope_type: val.scope_type,
      department_id: val.department_id,
      designation_id: val.designation_id,
      employee_id: val.employee_id
    }).subscribe({
      next: (res: any) => {
        this.policyPreview = res?.data || null;
        this.cdr.markForCheck();
      }
    });
  }

  submitPolicy(): void {
    if (this.policyForm.invalid) return;
    this.isSubmittingPolicy = true;
    this.cdr.markForCheck();

    const val = this.policyForm.value;
    const req$ = this.editingPolicy
      ? this.policyService.updatePolicy(this.editingPolicy.id, val)
      : this.policyService.createPolicy(val);

    req$.pipe(
      finalize(() => {
        this.isSubmittingPolicy = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Policy saved and employee balances synced successfully!', 'Close', { duration: 3500 });
        this.closePolicyModal();
        this.loadPolicies();
        this.loadAllBalances();
        this.loadMyBalances();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to save leave policy', 'Close', { duration: 4000 });
        this.cdr.markForCheck();
      }
    });
  }

  deletePolicy(p: any): void {
    if (!confirm(`Are you sure you want to delete policy '${p.policy_name}'? Employee balances will be recalculated using fallback policies.`)) return;

    this.policyService.deletePolicy(p.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Policy deleted', 'Close', { duration: 3000 });
        this.loadPolicies();
        this.loadAllBalances();
        this.loadMyBalances();
      }
    });
  }

  approve(l: any): void {
    this.leaveService.approve(l.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave approved', 'Close', { duration: 3000 });
        this.loadLeaves();
        this.loadAllBalances();
        this.loadMyBalances();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to approve leave', 'Close', { duration: 3000 });
      }
    });
  }

  reject(l: any): void {
    this.leaveService.reject(l.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave rejected', 'Close', { duration: 3000 });
        this.loadLeaves();
      }
    });
  }

  cancel(l: any): void {
    this.leaveService.cancel(l.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave cancelled', 'Close', { duration: 3000 });
        this.loadLeaves();
        this.loadAllBalances();
        this.loadMyBalances();
      }
    });
  }
}
