import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { AttendanceService } from '../../services/attendance.service';
import { NotificationService } from '../../services/notification.service';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatSelectModule, MatFormFieldModule, MatTableModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">

      <!-- Loading Bar -->
      <div class="inline-loader" *ngIf="isDashboardLoading">
        <mat-spinner diameter="32"></mat-spinner>
        <span>Refreshing {{roleLabel}} Dashboard...</span>
      </div>

      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="banner-text">
          <h2>Welcome back, {{userName}} 👋</h2>
          <p class="subtitle">{{welcomeSubtitle}}</p>
        </div>
        <div class="role-badge">
          <mat-chip class="chip-role" selected><mat-icon inline>verified_user</mat-icon> {{roleLabel}}</mat-chip>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 1. EMPLOYEE DASHBOARD -->
      <!-- ================================================================= -->
      <div *ngIf="authService.isEmployee()">
        <!-- Attendance & Work Mode Card -->
        <mat-card class="content-card margin-top-sm">
          <mat-card-header>
            <mat-card-title><mat-icon class="title-icon">access_time</mat-icon> Today's Attendance & Work Mode</mat-card-title>
          </mat-card-header>
          <mat-card-content class="att-card-body">
            <div class="att-status-grid">
              <div class="att-stat">
                <span class="label">Work Mode</span>
                <mat-form-field appearance="outline" class="w-mode-select" *ngIf="!todayAtt?.check_in">
                  <mat-select [(ngModel)]="selectedWorkMode">
                    <mat-option value="Office"><mat-icon inline>business</mat-icon> Office</mat-option>
                    <mat-option value="Work From Home"><mat-icon inline>home</mat-icon> WFH</mat-option>
                    <mat-option value="Hybrid"><mat-icon inline>alt_route</mat-icon> Hybrid</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-chip *ngIf="todayAtt?.check_in" class="chip-work-mode" selected>{{todayAtt?.work_mode || selectedWorkMode}}</mat-chip>
              </div>
              <div class="att-stat">
                <span class="label">Check In</span>
                <span class="val">{{todayAtt?.check_in || '--:--'}}</span>
              </div>
              <div class="att-stat">
                <span class="label">Check Out</span>
                <span class="val">{{todayAtt?.check_out || '--:--'}}</span>
              </div>
              <div class="att-stat">
                <span class="label">Working Hours</span>
                <span class="val highlight">{{todayAtt?.formatted_working_hours || (todayAtt?.working_hours ? todayAtt.working_hours + ' hrs' : '0h 00m')}}</span>
              </div>
              <div class="att-actions">
                <button mat-raised-button color="primary" (click)="doCheckIn()" [disabled]="todayAtt?.check_in || isAttSubmitting">
                  <mat-icon>login</mat-icon> Check In
                </button>
                <button mat-raised-button color="accent" (click)="doCheckOut()" [disabled]="!todayAtt?.check_in || todayAtt?.check_out || isAttSubmitting">
                  <mat-icon>logout</mat-icon> Check Out
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Leave Balance Grid & Performance -->
        <div class="grid-2col margin-top">
          <!-- Leave Balances -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">event_available</mat-icon> Leave Balances</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/leaves">Apply Leave</a>
            </mat-card-header>
            <mat-card-content>
              <div class="lb-grid" *ngIf="empDashboardData?.leaveBalances?.length">
                <div class="lb-item" *ngFor="let lb of empDashboardData.leaveBalances">
                  <div class="lb-name">{{lb.leave_type_name}}</div>
                  <div class="lb-val">{{lb.remaining_days}} <span class="lb-sub">/ {{lb.total_days}} days</span></div>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!empDashboardData?.leaveBalances?.length">
                <p>No leave balances found.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Performance Summary -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">star</mat-icon> My Performance Review</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/performance">View Details</a>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="empDashboardData?.performanceSummary" class="perf-box">
                <div class="perf-rating">
                  <span class="score">{{empDashboardData.performanceSummary.overall_rating}}</span>
                  <span class="max">/ 5.0</span>
                </div>
                <div class="perf-meta">
                  <strong>Period: {{empDashboardData.performanceSummary.review_period}}</strong>
                  <p class="comments">"{{empDashboardData.performanceSummary.comments || 'Keep up the solid performance.'}}"</p>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!empDashboardData?.performanceSummary">
                <p>No performance review available yet.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tasks & Deadlines Section -->
        <div class="grid-2col margin-top">
          <!-- My Tasks -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">task_alt</mat-icon> My Assigned Tasks</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/tasks">All Tasks</a>
            </mat-card-header>
            <mat-card-content>
              <div class="task-list" *ngIf="empDashboardData?.myTasks?.length">
                <div class="task-item" *ngFor="let t of empDashboardData.myTasks">
                  <div class="task-info">
                    <strong>{{t.title}}</strong>
                    <p class="task-desc" *ngIf="t.description">{{t.description}}</p>
                    <span class="task-by">Assigned by {{t.assigned_by_name || 'Manager'}} • Due {{t.due_date | date:'mediumDate'}}</span>
                  </div>
                  <mat-chip [class]="'chip-' + t.status">{{t.status | uppercase}}</mat-chip>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!empDashboardData?.myTasks?.length">
                <p>No tasks currently assigned to you.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Notifications Widget -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="title-icon">notifications</mat-icon> 🔔 Latest Notifications
                <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}} unread</span>
              </mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/notifications">View All</a>
            </mat-card-header>
            <mat-card-content>
              <div class="notif-widget-list" *ngIf="notifications?.length">
                <div class="notif-widget-item" *ngFor="let n of notifications" [class.unread]="!n.is_read" (click)="markNotifRead(n)">
                  <div class="nw-icon"><mat-icon inline>info</mat-icon></div>
                  <div class="nw-body">
                    <strong>{{n.title}}</strong>
                    <p>{{n.message}}</p>
                    <span class="nw-time">{{n.created_at | date:'short'}}</span>
                  </div>
                  <mat-icon class="unread-dot" *ngIf="!n.is_read">circle</mat-icon>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!notifications?.length">
                <p>No notifications available.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Latest Payslip & Holidays -->
        <div class="grid-2col margin-top">
          <!-- Latest Salary Slip Card -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">receipt</mat-icon> Latest Salary Slip</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/payroll">View Payroll</a>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="empDashboardData?.latestPayslip" class="payslip-widget">
                <div class="ps-row">
                  <span>Pay Period:</span>
                  <strong>{{getMonthName(empDashboardData.latestPayslip.month)}} {{empDashboardData.latestPayslip.year}}</strong>
                </div>
                <div class="ps-row">
                  <span>Net Salary:</span>
                  <strong class="ps-net">₹{{(empDashboardData.latestPayslip.net_salary || 0) | number}}</strong>
                </div>
                <div class="ps-row">
                  <span>Status:</span>
                  <mat-chip [class]="'chip-' + empDashboardData.latestPayslip.status">{{empDashboardData.latestPayslip.status | uppercase}}</mat-chip>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!empDashboardData?.latestPayslip">
                <p>No salary slip generated yet.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Holidays -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">celebration</mat-icon> Upcoming Holidays</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/holidays">Calendar</a>
            </mat-card-header>
            <mat-card-content>
              <div class="holiday-list">
                <div class="holiday-item" *ngFor="let h of upcomingHolidays">
                  <div class="h-date-box">
                    <span class="h-day">{{h.date | date:'dd'}}</span>
                    <span class="h-month">{{h.date | date:'MMM'}}</span>
                  </div>
                  <div class="h-details">
                    <strong>{{h.name}}</strong>
                    <p>{{h.description}}</p>
                  </div>
                  <mat-chip [class]="'chip-' + h.type">{{h.type}}</mat-chip>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>


      <!-- ================================================================= -->
      <!-- 2. MANAGER DASHBOARD -->
      <!-- ================================================================= -->
      <div *ngIf="authService.isManager()">
        <!-- Manager Team Summary Stat Cards -->
        <div class="stat-grid margin-top-sm">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{mgrDashboardData?.teamSize ?? 0}}</div>
                  <div class="stat-label">Team Members</div>
                </div>
                <div class="stat-icon bg-blue"><mat-icon>groups</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Direct Reports</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{mgrDashboardData?.presentToday ?? 0}}</div>
                  <div class="stat-label">Present Today</div>
                </div>
                <div class="stat-icon bg-green"><mat-icon>check_circle</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-up">Team Active</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{mgrDashboardData?.pendingLeaves ?? 0}}</div>
                  <div class="stat-label">Pending Team Leaves</div>
                </div>
                <div class="stat-icon bg-orange"><mat-icon>event_busy</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">Needs Approval</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{mgrDashboardData?.pendingTasks ?? 0}}</div>
                  <div class="stat-label">Pending Team Tasks</div>
                </div>
                <div class="stat-icon bg-purple"><mat-icon>assignment_late</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">{{mgrDashboardData?.overdueTasks || 0}} Overdue</span></div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Team Attendance & Pending Leaves -->
        <div class="grid-2col margin-top">
          <!-- Team Attendance Summary -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">access_time</mat-icon> Team Today's Attendance</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/attendance">View All</a>
            </mat-card-header>
            <mat-card-content>
              <div class="list-item" *ngFor="let member of mgrDashboardData?.teamAttendance">
                <div class="avatar-sm">{{getInitials(member.first_name, member.last_name)}}</div>
                <div class="item-details">
                  <div class="item-title">{{member.employee_name}}</div>
                  <div class="item-sub">Check-in: {{member.check_in || 'Not checked in'}}</div>
                </div>
                <mat-chip [class]="'chip-' + (member.status || 'absent')">{{(member.status || 'absent') | uppercase}}</mat-chip>
              </div>
              <div class="no-records-msg" *ngIf="!mgrDashboardData?.teamAttendance?.length">
                <p>No team attendance records for today.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Pending Leave Requests from Team -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">event_note</mat-icon> Team Pending Leave Requests</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/leaves">Review Leaves</a>
            </mat-card-header>
            <mat-card-content>
              <div class="list-item" *ngFor="let lr of mgrDashboardData?.pendingLeaveRequests">
                <div class="item-details">
                  <div class="item-title">{{lr.employee_name}}</div>
                  <div class="item-sub">{{lr.leave_type_name}} • {{lr.start_date | date:'mediumDate'}} to {{lr.end_date | date:'mediumDate'}} ({{lr.days}} days)</div>
                </div>
                <mat-chip class="chip-pending">PENDING</mat-chip>
              </div>
              <div class="no-records-msg" *ngIf="!mgrDashboardData?.pendingLeaveRequests?.length">
                <p>No pending leave applications from your team.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Team Tasks & Notifications Widget -->
        <div class="grid-2col margin-top">
          <!-- Team Tasks -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">task</mat-icon> Team Tasks & Status</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/tasks">Manage Tasks</a>
            </mat-card-header>
            <mat-card-content>
              <div class="task-list" *ngIf="mgrDashboardData?.teamTasks?.length">
                <div class="task-item" *ngFor="let t of mgrDashboardData.teamTasks">
                  <div class="task-info">
                    <strong>{{t.title}}</strong>
                    <span class="task-by">Assigned to {{t.assigned_name || 'Team member'}} • Priority: {{t.priority}}</span>
                  </div>
                  <mat-chip [class]="'chip-' + t.status">{{t.status | uppercase}}</mat-chip>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!mgrDashboardData?.teamTasks?.length">
                <p>No active tasks in team.</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Notifications Widget -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="title-icon">notifications</mat-icon> 🔔 Manager Notifications
                <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}} unread</span>
              </mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/notifications">View All</a>
            </mat-card-header>
            <mat-card-content>
              <div class="notif-widget-list" *ngIf="notifications?.length">
                <div class="notif-widget-item" *ngFor="let n of notifications" [class.unread]="!n.is_read" (click)="markNotifRead(n)">
                  <div class="nw-icon"><mat-icon inline>info</mat-icon></div>
                  <div class="nw-body">
                    <strong>{{n.title}}</strong>
                    <p>{{n.message}}</p>
                    <span class="nw-time">{{n.created_at | date:'short'}}</span>
                  </div>
                  <mat-icon class="unread-dot" *ngIf="!n.is_read">circle</mat-icon>
                </div>
              </div>
              <div class="no-records-msg" *ngIf="!notifications?.length">
                <p>No notifications.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>


      <!-- ================================================================= -->
      <!-- 3. HR DASHBOARD -->
      <!-- ================================================================= -->
      <div *ngIf="authService.isHR()">
        <div class="stat-grid margin-top-sm">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{hrDashboardData?.totalEmployees ?? 0}}</div>
                  <div class="stat-label">Total Employees</div>
                </div>
                <div class="stat-icon bg-blue"><mat-icon>people</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-up">+{{hrDashboardData?.newEmployees || 0}} new</span> this month</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{hrDashboardData?.attendanceSummary?.present ?? 0}}</div>
                  <div class="stat-label">Present Today</div>
                </div>
                <div class="stat-icon bg-green"><mat-icon>check_circle</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">{{hrDashboardData?.attendanceSummary?.absent || 0}} absent</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{hrDashboardData?.pendingLeaveCount ?? 0}}</div>
                  <div class="stat-label">Pending Leave Requests</div>
                </div>
                <div class="stat-icon bg-orange"><mat-icon>event_busy</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">Needs HR Action</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">₹{{(+hrDashboardData?.totalMonthlyPayroll || 0) | number}}</div>
                  <div class="stat-label">Monthly Payroll</div>
                </div>
                <div class="stat-icon bg-purple"><mat-icon>payments</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Current Month</span></div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid-2col margin-top">
          <!-- Department Distribution -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">pie_chart</mat-icon> Department Headcount</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-container">
              <div class="dept-progress-list">
                <div class="dp-item" *ngFor="let d of hrDashboardData?.departmentDistribution">
                  <div class="dp-header">
                    <span>{{d.name}}</span>
                    <strong>{{d.count}} staff</strong>
                  </div>
                  <div class="dp-bar-bg">
                    <div class="dp-bar-fill" [style.width.%]="(+d.count || 0) * 10"></div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- HR Notifications Widget -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="title-icon">notifications</mat-icon> 🔔 HR Notifications
                <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}} unread</span>
              </mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/notifications">View All</a>
            </mat-card-header>
            <mat-card-content>
              <div class="notif-widget-list" *ngIf="notifications?.length">
                <div class="notif-widget-item" *ngFor="let n of notifications" [class.unread]="!n.is_read" (click)="markNotifRead(n)">
                  <div class="nw-icon"><mat-icon inline>info</mat-icon></div>
                  <div class="nw-body">
                    <strong>{{n.title}}</strong>
                    <p>{{n.message}}</p>
                    <span class="nw-time">{{n.created_at | date:'short'}}</span>
                  </div>
                  <mat-icon class="unread-dot" *ngIf="!n.is_read">circle</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>


      <!-- ================================================================= -->
      <!-- 4. ADMIN DASHBOARD -->
      <!-- ================================================================= -->
      <div *ngIf="authService.isAdmin()">
        <!-- SECTION 1: Header Bar with Live Date & Refresh -->
        <div class="admin-header-bar margin-top-sm">
          <div class="header-date">
            <mat-icon inline color="primary">today</mat-icon>
            <strong>{{todayFormattedDate}}</strong>
          </div>
          <button mat-stroked-button color="primary" (click)="loadDashboard()" [disabled]="isDashboardLoading">
            <mat-icon>refresh</mat-icon> Refresh Dashboard
          </button>
        </div>

        <!-- SECTION 2: 12 Company KPI Cards -->
        <div class="stat-grid margin-top-sm">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.totalEmployees ?? 0}}</div>
                  <div class="stat-label">Total Employees</div>
                </div>
                <div class="stat-icon bg-blue"><mat-icon>people</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-up">{{adminData?.activeEmployees || 0}} Active</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.activeEmployees ?? 0}}</div>
                  <div class="stat-label">Active Employees</div>
                </div>
                <div class="stat-icon bg-green"><mat-icon>person_outline</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">{{adminData?.inactiveEmployees || 0}} Inactive</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.inactiveEmployees ?? 0}}</div>
                  <div class="stat-label">Inactive Employees</div>
                </div>
                <div class="stat-icon bg-red"><mat-icon>person_off</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Deactivated</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.totalDepartments ?? 0}}</div>
                  <div class="stat-label">Total Departments</div>
                </div>
                <div class="stat-icon bg-teal"><mat-icon>business</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Active Units</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.totalManagers ?? 0}}</div>
                  <div class="stat-label">Total Managers</div>
                </div>
                <div class="stat-icon bg-indigo"><mat-icon>supervisor_account</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">{{adminData?.totalManagers || 0}} Managers</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.presentToday ?? 0}}</div>
                  <div class="stat-label">Present Today</div>
                </div>
                <div class="stat-icon bg-green"><mat-icon>check_circle</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-up">Rate: {{adminData?.attendanceRate || 0}}%</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.absentToday ?? 0}}</div>
                  <div class="stat-label">Absent Today</div>
                </div>
                <div class="stat-icon bg-orange"><mat-icon>cancel</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">Unexcused</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.onLeaveToday ?? 0}}</div>
                  <div class="stat-label">On Leave Today</div>
                </div>
                <div class="stat-icon bg-amber"><mat-icon>flight_takeoff</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Approved Leaves</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.pendingLeaveRequests ?? 0}}</div>
                  <div class="stat-label">Pending Requests</div>
                </div>
                <div class="stat-icon bg-purple"><mat-icon>pending_actions</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">Action Required</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">₹{{(+adminData?.totalMonthlyPayroll || 0) | number}}</div>
                  <div class="stat-label">Monthly Payroll</div>
                </div>
                <div class="stat-icon bg-blue"><mat-icon>payments</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-neutral">Current Month</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.newJoinersThisMonth ?? 0}}</div>
                  <div class="stat-label">New Joiners</div>
                </div>
                <div class="stat-icon bg-teal"><mat-icon>person_add</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-up">Joined This Month</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon-row">
                <div>
                  <div class="stat-number">{{adminData?.overdueTasks ?? 0}}</div>
                  <div class="stat-label">Overdue Tasks</div>
                </div>
                <div class="stat-icon bg-red"><mat-icon>assignment_late</mat-icon></div>
              </div>
              <div class="stat-footer"><span class="badge-warn">Past Due</span></div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- SECTION 12: Quick Actions Panel -->
        <div class="margin-top">
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">flash_on</mat-icon> Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-actions-flex">
                <a mat-raised-button color="primary" routerLink="/employees"><mat-icon>person_add</mat-icon> + Add Employee</a>
                <a mat-raised-button color="accent" routerLink="/departments"><mat-icon>add_business</mat-icon> + Add Department</a>
                <a mat-stroked-button color="primary" routerLink="/designations"><mat-icon>badge</mat-icon> + Add Designation</a>
                <a mat-stroked-button color="primary" routerLink="/leave-policies"><mat-icon>policy</mat-icon> + Create Leave Policy</a>
                <a mat-stroked-button color="primary" routerLink="/announcements"><mat-icon>campaign</mat-icon> + Create Announcement</a>
                <a mat-button color="primary" routerLink="/reports"><mat-icon>assessment</mat-icon> View Reports</a>
                <a mat-button color="primary" routerLink="/audit-logs"><mat-icon>receipt_long</mat-icon> View Audit Logs</a>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Attendance & Leave Overview -->
        <div class="grid-2col margin-top">
          <!-- SECTION 3: Today's Attendance Overview -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">pie_chart</mat-icon> Today's Attendance Overview</mat-card-title>
              <span class="spacer"></span>
              <mat-chip class="chip-work-mode">{{adminData?.attendanceRate || 0}}% Rate</mat-chip>
            </mat-card-header>
            <mat-card-content>
              <div class="att-grid">
                <div class="att-box bg-box-green">
                  <span class="att-box-val">{{adminData?.attendanceStats?.present || 0}}</span>
                  <span class="att-box-lbl">Present</span>
                </div>
                <div class="att-box bg-box-red">
                  <span class="att-box-val">{{adminData?.attendanceStats?.absent || 0}}</span>
                  <span class="att-box-lbl">Absent</span>
                </div>
                <div class="att-box bg-box-amber">
                  <span class="att-box-val">{{adminData?.attendanceStats?.leave || 0}}</span>
                  <span class="att-box-lbl">On Leave</span>
                </div>
                <div class="att-box bg-box-orange">
                  <span class="att-box-val">{{adminData?.attendanceStats?.late || 0}}</span>
                  <span class="att-box-lbl">Late</span>
                </div>
                <div class="att-box bg-box-purple">
                  <span class="att-box-val">{{adminData?.attendanceStats?.halfDay || 0}}</span>
                  <span class="att-box-lbl">Half Day</span>
                </div>
              </div>
              <div class="margin-top-sm">
                <div class="dp-header">
                  <span>Overall Attendance Rate</span>
                  <strong>{{adminData?.attendanceRate || 0}}%</strong>
                </div>
                <div class="dp-bar-bg">
                  <div class="dp-bar-fill" [style.width.%]="adminData?.attendanceRate || 0"></div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- SECTION 4: Leave Overview -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">event_available</mat-icon> Leave Overview (Current Year)</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="lb-grid">
                <div class="lb-item">
                  <div class="lb-name">Approved Leaves</div>
                  <div class="lb-val color-green">{{adminData?.leaveStats?.approved || 0}}</div>
                </div>
                <div class="lb-item">
                  <div class="lb-name">Pending Approval</div>
                  <div class="lb-val color-orange">{{adminData?.leaveStats?.pending || 0}}</div>
                </div>
                <div class="lb-item">
                  <div class="lb-name">Rejected Leaves</div>
                  <div class="lb-val color-red">{{adminData?.leaveStats?.rejected || 0}}</div>
                </div>
                <div class="lb-item">
                  <div class="lb-name">Cancelled Leaves</div>
                  <div class="lb-val color-neutral">{{adminData?.leaveStats?.cancelled || 0}}</div>
                </div>
              </div>
              <mat-divider style="margin: 12px 0;"></mat-divider>
              <div class="leave-types-list" *ngIf="adminData?.leaveTypeBreakdown?.length">
                <div class="leave-type-chip" *ngFor="let lt of adminData.leaveTypeBreakdown">
                  <strong>{{lt.leave_type}}</strong>: {{lt.count}} requests
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- SECTION 8: Pending Leave Requests List -->
        <div class="margin-top">
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">pending_actions</mat-icon> Pending Leave Requests</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/leaves">View All Leaves</a>
            </mat-card-header>
            <mat-card-content>
              <div class="table-responsive" *ngIf="adminData?.pendingLeavesList?.length; else noPendingLeaves">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let lr of adminData.pendingLeavesList">
                      <td>
                        <strong>{{lr.employee_name}}</strong>
                        <div class="sub-code">{{lr.employee_code}}</div>
                      </td>
                      <td>{{lr.department_name || 'N/A'}}</td>
                      <td><span class="badge-leave-type">{{lr.leave_type}}</span></td>
                      <td>{{lr.start_date | date:'shortDate'}} - {{lr.end_date | date:'shortDate'}}</td>
                      <td><strong>{{lr.days}}</strong> day(s)</td>
                      <td><span class="reason-text" [matTooltip]="lr.reason">{{lr.reason || 'No reason specified'}}</span></td>
                      <td>
                        <button mat-flat-button color="primary" class="btn-sm" (click)="approveLeave(lr.id)">Approve</button>
                        <button mat-stroked-button color="warn" class="btn-sm margin-left-xs" (click)="rejectLeave(lr.id)">Reject</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noPendingLeaves>
                <div class="no-records-msg">
                  <mat-icon color="disabled">check_circle_outline</mat-icon>
                  <p>No pending leave requests requiring approval.</p>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Payroll & Department Distribution -->
        <div class="grid-2col margin-top">
          <!-- SECTION 7: Payroll Overview -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">trending_up</mat-icon> Monthly Payroll Expenditure Trend</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-container">
              <div class="payroll-summary-banner margin-bottom-sm">
                <div class="ps-stat">
                  <span class="lbl">Current Month</span>
                  <strong class="val">₹{{(adminData?.payrollSummary?.currentMonthAmount || adminData?.totalMonthlyPayroll || 0) | number}}</strong>
                </div>
                <div class="ps-stat">
                  <span class="lbl">Paid Employees</span>
                  <strong class="val color-green">{{adminData?.payrollSummary?.paidEmployeesCount || 0}}</strong>
                </div>
                <div class="ps-stat">
                  <span class="lbl">Pending Payroll</span>
                  <strong class="val color-orange">₹{{(adminData?.payrollSummary?.pendingPayrollAmount || 0) | number}}</strong>
                </div>
              </div>
              <div class="bar-chart flex-chart">
                <div class="chart-bar-item" *ngFor="let p of payrollData">
                  <div class="bar-fill" [style.height.%]="getBarHeight(p.amount)">
                    <span class="bar-val">₹{{getFormattedLakhs(p.amount)}}L</span>
                  </div>
                  <span class="bar-label">{{p.month}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- SECTION 6: Department-wise Employee Distribution -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">domain</mat-icon> Department-wise Employee Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="dept-progress-list" *ngIf="adminData?.departmentDistribution?.length; else noDepts">
                <div class="dp-item" *ngFor="let dept of adminData.departmentDistribution">
                  <div class="dp-header">
                    <span><strong>{{dept.name}}</strong></span>
                    <span>{{dept.count}} staff ({{getDeptPercent(dept.count)}}%)</span>
                  </div>
                  <div class="dp-bar-bg">
                    <div class="dp-bar-fill" [style.width.%]="getDeptPercent(dept.count)"></div>
                  </div>
                </div>
              </div>
              <ng-template #noDepts>
                <div class="no-records-msg">No active departments found.</div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tasks & Recent System Activity -->
        <div class="grid-2col margin-top">
          <!-- SECTION 9: Task Overview -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">assignment</mat-icon> Organization Task Overview</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/tasks">View All Tasks</a>
            </mat-card-header>
            <mat-card-content>
              <div class="task-summary-grid">
                <div class="ts-card">
                  <span class="ts-num">{{adminData?.taskSummary?.total || 0}}</span>
                  <span class="ts-lbl">Total</span>
                </div>
                <div class="ts-card bg-ts-green">
                  <span class="ts-num">{{adminData?.taskSummary?.completed || 0}}</span>
                  <span class="ts-lbl">Completed</span>
                </div>
                <div class="ts-card bg-ts-blue">
                  <span class="ts-num">{{adminData?.taskSummary?.in_progress || 0}}</span>
                  <span class="ts-lbl">In Progress</span>
                </div>
                <div class="ts-card bg-ts-yellow">
                  <span class="ts-num">{{adminData?.taskSummary?.todo || 0}}</span>
                  <span class="ts-lbl">To Do</span>
                </div>
                <div class="ts-card bg-ts-red">
                  <span class="ts-num">{{adminData?.taskSummary?.overdue || 0}}</span>
                  <span class="ts-lbl">Overdue</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- SECTION 10: Recent Activity Feed -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">history</mat-icon> Recent System Activity</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/audit-logs">Audit Logs</a>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-feed-list" *ngIf="adminData?.recentActivities?.length; else noAct">
                <div class="activity-item" *ngFor="let act of adminData.recentActivities">
                  <div class="act-icon"><mat-icon inline>lens</mat-icon></div>
                  <div class="act-body">
                    <strong>{{act.user_name || 'System'}}: {{act.action}}</strong>
                    <p class="act-desc">{{act.details}}</p>
                    <span class="act-time">{{act.created_at | date:'short'}}</span>
                  </div>
                </div>
              </div>
              <ng-template #noAct>
                <div class="no-records-msg">No recent system activity recorded.</div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Notifications & Upcoming Holidays -->
        <div class="grid-2col margin-top">
          <!-- SECTION 11: Admin Notifications -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="title-icon">notifications</mat-icon> 🔔 Admin Notifications
                <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}} unread</span>
              </mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/notifications">View All</a>
            </mat-card-header>
            <mat-card-content>
              <div class="notif-widget-list" *ngIf="notifications?.length; else noNotifs">
                <div class="notif-widget-item" *ngFor="let n of notifications" [class.unread]="!n.is_read" (click)="markNotifRead(n)">
                  <div class="nw-icon"><mat-icon inline>info</mat-icon></div>
                  <div class="nw-body">
                    <strong>{{n.title}}</strong>
                    <p>{{n.message}}</p>
                    <span class="nw-time">{{n.created_at | date:'short'}}</span>
                  </div>
                  <mat-icon class="unread-dot" *ngIf="!n.is_read">circle</mat-icon>
                </div>
              </div>
              <ng-template #noNotifs>
                <div class="no-records-msg">No notifications.</div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- SECTION 13: Upcoming Holidays -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title><mat-icon class="title-icon">event</mat-icon> Upcoming Holidays</mat-card-title>
              <span class="spacer"></span>
              <a mat-button color="primary" routerLink="/holidays">View Calendar</a>
            </mat-card-header>
            <mat-card-content>
              <div class="holiday-list" *ngIf="upcomingHolidays?.length; else noHols">
                <div class="holiday-item" *ngFor="let h of upcomingHolidays">
                  <div class="h-date-box">
                    <span class="h-day">{{h.date | date:'dd'}}</span>
                    <span class="h-month">{{h.date | date:'MMM'}}</span>
                  </div>
                  <div class="h-details">
                    <strong>{{h.name}}</strong>
                    <p>{{h.type || 'Public Holiday'}} ({{h.date | date:'EEEE'}})</p>
                  </div>
                </div>
              </div>
              <ng-template #noHols>
                <div class="no-records-msg">No upcoming holidays scheduled.</div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .welcome-banner { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex-wrap: wrap; gap: 16px; }
    .welcome-banner h2 { font-size: 1.5rem; font-weight: 700; color: #1a237e; margin: 0; }
    .subtitle { color: #666; font-size: 0.875rem; margin: 4px 0 0; }
    .chip-role { background: #e8eaf6 !important; color: #1a237e !important; font-weight: 700; text-transform: uppercase; }

    .margin-top-sm { margin-top: 12px; }
    .margin-top { margin-top: 20px; }

    .inline-loader { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #555; background: #e8eaf6; border-radius: 8px; margin-bottom: 16px; }

    .att-card-body { padding: 16px 20px; }
    .att-status-grid { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .att-stat { display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
    .att-stat .label { font-size: 0.75rem; color: #777; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .att-stat .val { font-size: 1.1rem; font-weight: 700; color: #333; }
    .att-stat .val.highlight { color: #1a237e; }
    .w-mode-select { max-width: 160px; }
    .w-mode-select ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .chip-work-mode { background-color: #e8eaf6 !important; color: #1a237e !important; font-weight: 600; }
    .att-actions { display: flex; gap: 12px; align-items: center; }

    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .stat-card { border-radius: 12px !important; }
    .stat-icon-row { display: flex; justify-content: space-between; align-items: center; }
    .stat-number { font-size: 1.8rem; font-weight: 800; color: #1a237e; }
    .stat-label { font-size: 0.85rem; color: #666; font-weight: 500; }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
    .bg-blue { background: #1a237e; }
    .bg-green { background: #2e7d32; }
    .bg-orange { background: #e65100; }
    .bg-purple { background: #6a1b9a; }
    .bg-teal { background: #00796b; }
    .bg-indigo { background: #303f9f; }
    .bg-red { background: #d32f2f; }
    .bg-amber { background: #f57c00; }
    .stat-footer { font-size: 0.75rem; color: #888; margin-top: 12px; }
    .badge-up { color: #2e7d32; font-weight: 700; }
    .badge-warn { color: #e65100; font-weight: 700; }
    .badge-neutral { color: #555; }

    .admin-header-bar { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .header-date { font-size: 0.95rem; color: #1a237e; display: flex; align-items: center; gap: 8px; }

    .quick-actions-flex { display: flex; flex-wrap: wrap; gap: 12px; }

    .att-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 10px; margin-top: 8px; }
    .att-box { padding: 10px; border-radius: 8px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
    .att-box-val { font-size: 1.3rem; font-weight: 800; }
    .att-box-lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; opacity: 0.85; }
    .bg-box-green { background: #e8f5e9; color: #2e7d32; }
    .bg-box-red { background: #ffebee; color: #c62828; }
    .bg-box-amber { background: #fff3e0; color: #ef6c00; }
    .bg-box-orange { background: #fff8e1; color: #f57f17; }
    .bg-box-purple { background: #f3e5f5; color: #7b1fa2; }

    .color-green { color: #2e7d32; }
    .color-orange { color: #e65100; }
    .color-red { color: #c62828; }
    .color-neutral { color: #666; }

    .leave-types-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .leave-type-chip { background: #f0f4f8; border-radius: 6px; padding: 6px 12px; font-size: 0.8rem; color: #333; }

    .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    .admin-table th { background: #f5f5f5; padding: 10px; color: #555; font-weight: 600; border-bottom: 2px solid #eee; }
    .admin-table td { padding: 10px; border-bottom: 1px solid #eee; color: #333; }
    .sub-code { font-size: 0.75rem; color: #777; }
    .badge-leave-type { background: #e8eaf6; color: #1a237e; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
    .reason-text { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: middle; }
    .btn-sm { font-size: 0.75rem !important; padding: 0 12px !important; height: 28px !important; line-height: 28px !important; }
    .margin-left-xs { margin-left: 6px; }

    .payroll-summary-banner { display: flex; justify-content: space-around; background: #fafafa; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
    .ps-stat { display: flex; flex-direction: column; text-align: center; }
    .ps-stat .lbl { font-size: 0.75rem; color: #777; font-weight: 600; text-transform: uppercase; }
    .ps-stat .val { font-size: 1.1rem; font-weight: 700; color: #1a237e; }

    .task-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(85px, 1fr)); gap: 8px; }
    .ts-card { background: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
    .ts-num { font-size: 1.2rem; font-weight: 800; color: #333; }
    .ts-lbl { font-size: 0.7rem; color: #666; font-weight: 600; text-transform: uppercase; }
    .bg-ts-green { background: #e8f5e9; } .bg-ts-green .ts-num { color: #2e7d32; }
    .bg-ts-blue { background: #e3f2fd; } .bg-ts-blue .ts-num { color: #1565c0; }
    .bg-ts-yellow { background: #fffde7; } .bg-ts-yellow .ts-num { color: #f57f17; }
    .bg-ts-red { background: #ffebee; } .bg-ts-red .ts-num { color: #c62828; }

    .activity-feed-list { display: flex; flex-direction: column; gap: 10px; }
    .activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .activity-item:last-child { border-bottom: none; }
    .act-icon { color: #3f51b5; font-size: 10px; margin-top: 4px; }
    .act-body { flex: 1; }
    .act-body strong { font-size: 0.85rem; color: #222; }
    .act-desc { font-size: 0.78rem; color: #666; margin: 2px 0; }
    .act-time { font-size: 0.7rem; color: #888; }

    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 900px) { .grid-2col { grid-template-columns: 1fr; } }
    .content-card { border-radius: 12px !important; }
    .title-icon { color: #1a237e; vertical-align: middle; margin-right: 8px; }

    .lb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .lb-item { background: #f8f9fa; border-radius: 8px; padding: 12px; }
    .lb-name { font-size: 0.8rem; color: #666; font-weight: 600; }
    .lb-val { font-size: 1.25rem; font-weight: 700; color: #1a237e; margin-top: 2px; }
    .lb-sub { font-size: 0.75rem; font-weight: 400; color: #888; }

    .perf-box { display: flex; gap: 16px; align-items: center; background: #f4f5fa; padding: 14px; border-radius: 10px; }
    .perf-rating { background: #1a237e; color: white; padding: 10px 14px; border-radius: 8px; text-align: center; }
    .perf-rating .score { font-size: 1.5rem; font-weight: 800; }
    .perf-rating .max { font-size: 0.75rem; opacity: 0.8; }
    .perf-meta p { margin: 4px 0 0; font-size: 0.85rem; color: #555; font-style: italic; }

    .task-list { display: flex; flex-direction: column; gap: 10px; }
    .task-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fafafa; border-radius: 8px; border-left: 3px solid #1a237e; }
    .task-info strong { font-size: 0.9rem; color: #222; }
    .task-desc { font-size: 0.8rem; color: #666; margin: 2px 0 4px; }
    .task-by { font-size: 0.75rem; color: #888; }

    .notif-badge { background: #e53935; color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .notif-widget-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-widget-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: #fff; border: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
    .notif-widget-item:hover { background: #f5f5f5; }
    .notif-widget-item.unread { background: #e8eaf6; border-left: 4px solid #1a237e; }
    .nw-icon { color: #1a237e; }
    .nw-body { flex: 1; }
    .nw-body strong { font-size: 0.85rem; color: #222; display: block; }
    .nw-body p { font-size: 0.78rem; color: #555; margin: 2px 0; }
    .nw-time { font-size: 0.7rem; color: #888; }
    .unread-dot { color: #3f51b5; font-size: 10px; height: 10px; width: 10px; }

    .payslip-widget { background: #fafafa; padding: 14px; border-radius: 10px; border: 1px solid #eee; }
    .ps-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #ddd; }
    .ps-row:last-child { border-bottom: none; }
    .ps-net { color: #2e7d32; font-size: 1.2rem; }

    .holiday-list { display: flex; flex-direction: column; gap: 10px; }
    .holiday-item { display: flex; align-items: center; gap: 12px; padding: 8px; background: #f8f9fa; border-radius: 8px; }
    .h-date-box { background: #1a237e; color: white; padding: 4px 10px; border-radius: 6px; text-align: center; }
    .h-day { font-weight: 700; font-size: 1rem; }
    .h-month { font-size: 0.6rem; text-transform: uppercase; }
    .h-details { flex: 1; }
    .h-details strong { font-size: 0.85rem; color: #333; }
    .h-details p { font-size: 0.75rem; color: #666; margin: 0; }

    .chart-container { padding: 16px 8px; }
    .flex-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 160px; padding: 0 12px; border-bottom: 2px solid #e0e0e0; }
    .chart-bar-item { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
    .bar-fill { width: 32px; background: linear-gradient(180deg, #3f51b5 0%, #1a237e 100%); border-radius: 6px 6px 0 0; position: relative; transition: height 0.5s ease; min-height: 15px; }
    .bar-val { position: absolute; top: -18px; width: 100%; text-align: center; font-size: 0.68rem; font-weight: 700; color: #1a237e; }
    .bar-label { margin-top: 6px; font-size: 0.75rem; color: #666; }

    .dept-progress-list { display: flex; flex-direction: column; gap: 10px; }
    .dp-item { font-size: 0.85rem; }
    .dp-header { display: flex; justify-content: space-between; margin-bottom: 4px; color: #444; }
    .dp-bar-bg { background: #e8eaf6; height: 8px; border-radius: 4px; overflow: hidden; }
    .dp-bar-fill { background: #3f51b5; height: 100%; border-radius: 4px; }

    .list-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .list-item:last-child { border-bottom: none; }
    .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: #1a237e; color: white; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
    .item-details { flex: 1; }
    .item-title { font-weight: 600; font-size: 0.88rem; color: #333; }
    .item-sub { font-size: 0.75rem; color: #666; }

    .no-records-msg { text-align: center; padding: 24px; color: #888; font-size: 0.85rem; }
  `]
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private attendanceService = inject(AttendanceService);
  private notificationService = inject(NotificationService);
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  isDashboardLoading = false;
  isAttSubmitting = false;
  selectedWorkMode: 'Office' | 'Work From Home' | 'Hybrid' = 'Office';
  todayFormattedDate: string = '';

  adminData: any = null;
  hrDashboardData: any = null;
  mgrDashboardData: any = null;
  empDashboardData: any = null;

  todayAtt: any = null;
  notifications: any[] = [];
  unreadCount = 0;
  upcomingHolidays: any[] = [];
  payrollData: any[] = [];
  announcements: any[] = [];

  get userName(): string {
    return this.authService.currentUser?.name || 'User';
  }

  get roleLabel(): string {
    const role = this.authService.userRole;
    const r: Record<string, string> = { admin: "Administrator", hr: "HR Manager", manager: "Manager", employee: "Employee" };
    return r[role] || role;
  }

  get welcomeSubtitle(): string {
    if (this.authService.isEmployee()) return 'Here is your personal attendance, leave balance, assigned tasks, and notifications.';
    if (this.authService.isManager()) return 'Here is an overview of your team members, attendance, leave approvals, and tasks.';
    if (this.authService.isHR()) return 'Here is an overview of company staff, attendance, pending leave applications, and payroll.';
    return 'Here is an overview of your organization metrics, attendance, payroll trends, and audit activity.';
  }

  ngOnInit(): void {
    this.todayFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.loadDashboard();
    this.loadTodayAttendance();
    this.loadNotifications();
  }

  approveLeave(id: number): void {
    this.leaveService.approve(id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave request approved!', 'Close', { duration: 3000 });
        this.loadDashboard();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to approve leave', 'Close', { duration: 3000 });
      }
    });
  }

  rejectLeave(id: number): void {
    this.leaveService.reject(id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Leave request rejected', 'Close', { duration: 3000 });
        this.loadDashboard();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to reject leave', 'Close', { duration: 3000 });
      }
    });
  }

  getDeptPercent(count: number): number {
    const total = this.adminData?.activeEmployees || 1;
    return Math.round((count / total) * 100);
  }

  loadTodayAttendance(): void {
    this.attendanceService.getToday().subscribe({
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

  loadNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (res: any) => {
        this.notifications = (res?.data || []).slice(0, 5);
        this.cdr.markForCheck();
      }
    });
    this.notificationService.unreadCount$.subscribe(c => {
      this.unreadCount = c;
      this.cdr.markForCheck();
    });
    this.notificationService.refreshCount();
  }

  loadDashboard(): void {
    this.isDashboardLoading = true;
    this.cdr.markForCheck();

    let req$: Observable<any>;
    if (this.authService.isEmployee()) {
      req$ = this.dashboardService.getEmployeeDashboard();
    } else if (this.authService.isManager()) {
      req$ = this.dashboardService.getManagerDashboard();
    } else if (this.authService.isHR()) {
      req$ = this.dashboardService.getHRDashboard();
    } else {
      req$ = this.dashboardService.getAdminDashboard();
    }

    req$.pipe(
      finalize(() => {
        this.isDashboardLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        const d = res?.data || res;
        if (d) {
          if (this.authService.isEmployee()) {
            this.empDashboardData = d;
            if (d.todayAttendance) this.todayAtt = d.todayAttendance;
            if (d.latestNotifications?.length) this.notifications = d.latestNotifications;
            if (d.upcomingHolidays?.length) this.upcomingHolidays = d.upcomingHolidays;
          } else if (this.authService.isManager()) {
            this.mgrDashboardData = d;
            if (d.notifications?.length) this.notifications = d.notifications;
            if (d.upcomingHolidays?.length) this.upcomingHolidays = d.upcomingHolidays;
          } else if (this.authService.isHR()) {
            this.hrDashboardData = d;
            if (d.notifications?.length) this.notifications = d.notifications;
            if (d.upcomingHolidays?.length) this.upcomingHolidays = d.upcomingHolidays;
            if (d.announcements?.length) this.announcements = d.announcements;
          } else {
            this.adminData = d;
            if (d.monthlyPayrollData?.length) this.payrollData = d.monthlyPayrollData;
            if (d.upcomingHolidays?.length) this.upcomingHolidays = d.upcomingHolidays;
            if (d.notifications?.length) this.notifications = d.notifications;
            if (d.announcements?.length) this.announcements = d.announcements;
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  markNotifRead(n: any): void {
    if (!n.is_read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          n.is_read = 1;
          this.cdr.markForCheck();
        }
      });
    }
  }

  getInitials(firstName?: string, lastName?: string): string {
    const f = firstName ? firstName[0] : 'E';
    const l = lastName ? lastName[0] : '';
    return (f + l).toUpperCase();
  }

  getMonthName(m?: number): string {
    if (!m) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[(m - 1) % 12] || 'Month';
  }

  getBarHeight(amount: any): number {
    const num = +amount || 0;
    const height = (num / 1300000) * 100;
    return Math.min(Math.max(height, 15), 100);
  }

  getFormattedLakhs(amount: any): string {
    const num = +amount || 0;
    return (num / 100000).toFixed(1);
  }

  doCheckIn(): void {
    this.isAttSubmitting = true;
    this.cdr.markForCheck();
    this.attendanceService.checkIn(this.selectedWorkMode).pipe(
      finalize(() => {
        this.isAttSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Checked in successfully!', 'Close', { duration: 3500 });
        this.loadTodayAttendance();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  doCheckOut(): void {
    this.isAttSubmitting = true;
    this.cdr.markForCheck();
    this.attendanceService.checkOut().pipe(
      finalize(() => {
        this.isAttSubmitting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || 'Checked out successfully!', 'Close', { duration: 3500 });
        this.loadTodayAttendance();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }
}
