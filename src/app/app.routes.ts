import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then(m => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'hr', 'manager'] },
        loadComponent: () => import('./pages/employees/employees').then(m => m.Employees)
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'hr', 'manager'] },
        loadComponent: () => import('./pages/departments/departments').then(m => m.Departments)
      },
      {
        path: 'designations',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'hr', 'manager'] },
        loadComponent: () => import('./pages/designations/designations').then(m => m.Designations)
      },
      { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance').then(m => m.Attendance) },
      { path: 'leaves', loadComponent: () => import('./pages/leaves/leaves').then(m => m.Leaves) },
      { path: 'payroll', loadComponent: () => import('./pages/payroll/payroll').then(m => m.Payroll) },
      { path: 'tasks', loadComponent: () => import('./pages/tasks/tasks').then(m => m.Tasks) },
      { path: 'performance', loadComponent: () => import('./pages/performance/performance').then(m => m.Performance) },
      { path: 'holidays', loadComponent: () => import('./pages/holidays/holidays').then(m => m.Holidays) },
      { path: 'announcements', loadComponent: () => import('./pages/announcements/announcements').then(m => m.Announcements) },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'hr'] },
        loadComponent: () => import('./pages/reports/reports').then(m => m.Reports)
      },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
