const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/Dell/Desktop/RYIMP/employeManagment/employeManagmentFe/src/app';

const mkdir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const write = (filepath, content) => {
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, content.trim() + '\n');
};

const services = [
    'employee', 'department', 'designation', 'attendance', 'leave', 
    'payroll', 'task', 'performance', 'holiday', 'announcement', 
    'notification', 'report', 'dashboard'
];

for (const svc of services) {
    let content = "import { Injectable, inject } from '@angular/core';\n" +
                  "import { HttpClient } from '@angular/common/http';\n" +
                  "import { Observable } from 'rxjs';\n\n" +
                  "@Injectable({ providedIn: 'root' })\n" +
                  "export class " + (svc.charAt(0).toUpperCase() + svc.slice(1)) + "Service {\n" +
                  "  private apiUrl = 'http://localhost:3000/api/" + svc + "s';\n" +
                  "  private http = inject(HttpClient);\n\n" +
                  "  getAll(params?: any): Observable<any> {\n" +
                  "    return this.http.get(this.apiUrl, { params });\n" +
                  "  }\n" +
                  "  getById(id: number): Observable<any> {\n" +
                  "    return this.http.get(`${this.apiUrl}/${id}`);\n" +
                  "  }\n" +
                  "  create(data: any): Observable<any> {\n" +
                  "    return this.http.post(this.apiUrl, data);\n" +
                  "  }\n" +
                  "  update(id: number, data: any): Observable<any> {\n" +
                  "    return this.http.put(`${this.apiUrl}/${id}`, data);\n" +
                  "  }\n" +
                  "  delete(id: number): Observable<any> {\n" +
                  "    return this.http.delete(`${this.apiUrl}/${id}`);\n" +
                  "  }\n" +
                  "}\n";
    
    if (svc === 'employee') {
        content = content.replace("}\n", 
          "  toggleStatus(id: number): Observable<any> {\n" +
          "    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});\n" +
          "  }\n" +
          "  getProfile(): Observable<any> {\n" +
          "    return this.http.get(`${this.apiUrl}/profile`);\n" +
          "  }\n" +
          "}\n");
    } else if (svc === 'notification') {
        content = "import { Injectable, inject } from '@angular/core';\n" +
                  "import { HttpClient } from '@angular/common/http';\n" +
                  "import { BehaviorSubject, Observable } from 'rxjs';\n\n" +
                  "@Injectable({ providedIn: 'root' })\n" +
                  "export class NotificationService {\n" +
                  "  private apiUrl = 'http://localhost:3000/api/notifications';\n" +
                  "  private http = inject(HttpClient);\n" +
                  "  public unreadCount = new BehaviorSubject<number>(0);\n\n" +
                  "  getAll(params?: any): Observable<any> {\n" +
                  "    return this.http.get(this.apiUrl, { params });\n" +
                  "  }\n" +
                  "  markAsRead(id: number): Observable<any> {\n" +
                  "    return this.http.put(`${this.apiUrl}/${id}/read`, {});\n" +
                  "  }\n" +
                  "}\n";
    }
    write(path.join(basePath, 'services', svc + '.service.ts'), content);
}

write(path.join(basePath, 'guards', 'role-guard.ts'), 
"import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';\n" +
"import { inject } from '@angular/core';\n" +
"import { AuthService } from '../service/auth';\n\n" +
"export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {\n" +
"  const router = inject(Router);\n" +
"  const authService = inject(AuthService);\n" +
"  const allowedRoles: string[] = route.data?.['roles'] || [];\n\n" +
"  if (!authService.isLoggedIn) return router.createUrlTree(['/login']);\n" +
"  if (allowedRoles.length === 0) return true;\n" +
"  if (authService.hasRole(...allowedRoles)) return true;\n" +
"  return router.createUrlTree(['/dashboard']);\n" +
"};\n");

write(path.join(basePath, 'app.routes.ts'), 
"import { Routes } from '@angular/router';\n" +
"import { authGuard } from './guards/auth-guard';\n" +
"import { roleGuard } from './guards/role-guard';\n\n" +
"export const routes: Routes = [\n" +
"  { path: '', redirectTo: 'login', pathMatch: 'full' },\n" +
"  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },\n" +
"  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },\n" +
"  { path: '', loadComponent: () => import('./layout/shell/shell').then(m => m.Shell), canActivate: [authGuard],\n" +
"    children: [\n" +
"      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },\n" +
"      { path: 'employees', loadComponent: () => import('./pages/employees/employee-list/employee-list').then(m => m.EmployeeList) },\n" +
"      { path: 'employees/add', loadComponent: () => import('./pages/employees/employee-form/employee-form').then(m => m.EmployeeForm) },\n" +
"      { path: 'employees/:id', loadComponent: () => import('./pages/employees/employee-detail/employee-detail').then(m => m.EmployeeDetail) },\n" +
"      { path: 'employees/:id/edit', loadComponent: () => import('./pages/employees/employee-form/employee-form').then(m => m.EmployeeForm) },\n" +
"      { path: 'departments', loadComponent: () => import('./pages/departments/departments').then(m => m.Departments) },\n" +
"      { path: 'designations', loadComponent: () => import('./pages/designations/designations').then(m => m.Designations) },\n" +
"      { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance').then(m => m.AttendancePage) },\n" +
"      { path: 'leaves', loadComponent: () => import('./pages/leaves/leaves').then(m => m.Leaves) },\n" +
"      { path: 'payroll', loadComponent: () => import('./pages/payroll/payroll').then(m => m.Payroll) },\n" +
"      { path: 'tasks', loadComponent: () => import('./pages/tasks/tasks').then(m => m.Tasks) },\n" +
"      { path: 'performance', loadComponent: () => import('./pages/performance/performance').then(m => m.Performance) },\n" +
"      { path: 'holidays', loadComponent: () => import('./pages/holidays/holidays').then(m => m.Holidays) },\n" +
"      { path: 'announcements', loadComponent: () => import('./pages/announcements/announcements').then(m => m.Announcements) },\n" +
"      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsPage) },\n" +
"      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },\n" +
"      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },\n" +
"    ]\n" +
"  },\n" +
"  { path: '**', redirectTo: 'dashboard' }\n" +
"];\n");

const pages = [
  'login/login', 'register/register', 'dashboard/dashboard',
  'employees/employee-list/employee-list', 'employees/employee-form/employee-form', 'employees/employee-detail/employee-detail',
  'departments/departments', 'designations/designations', 'attendance/attendance', 'leaves/leaves',
  'payroll/payroll', 'tasks/tasks', 'performance/performance', 'holidays/holidays', 'announcements/announcements',
  'notifications/notifications', 'profile/profile', 'settings/settings'
];

for (const p of pages) {
    const parts = p.split('/');
    const name = parts[parts.length - 1];
    const ClassName = name.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
    const suffix = (ClassName === 'Attendance' || ClassName === 'Notifications') ? 'Page' : '';
    write(path.join(basePath, 'pages', p + '.ts'), 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"import { MatCardModule } from '@angular/material/card';\n\n" +
"@Component({\n" +
"  selector: 'app-" + name + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule, MatCardModule],\n" +
"  template: '<mat-card><mat-card-content>" + ClassName + " Works!</mat-card-content></mat-card>'\n" +
"})\n" +
"export class " + ClassName + suffix + " {}\n");
}

write(path.join(basePath, 'layout/shell/shell.ts'), 
"import { Component, inject } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"import { RouterModule } from '@angular/router';\n" +
"import { MatSidenavModule } from '@angular/material/sidenav';\n" +
"import { MatToolbarModule } from '@angular/material/toolbar';\n" +
"import { MatIconModule } from '@angular/material/icon';\n" +
"import { MatListModule } from '@angular/material/list';\n" +
"import { AuthService } from '../../service/auth';\n\n" +
"@Component({\n" +
"  selector: 'app-shell',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule],\n" +
"  template: `\n" +
"<mat-sidenav-container class=\"sidenav-container\">\n" +
"  <mat-sidenav mode=\"side\" opened class=\"sidenav\">\n" +
"    <div class=\"logo\"><h2>Employee Management</h2></div>\n" +
"    <mat-nav-list>\n" +
"      <a mat-list-item routerLink=\"/dashboard\"><mat-icon>dashboard</mat-icon> Dashboard</a>\n" +
"      <a mat-list-item routerLink=\"/employees\"><mat-icon>people</mat-icon> Employees</a>\n" +
"    </mat-nav-list>\n" +
"  </mat-sidenav>\n" +
"  <mat-sidenav-content class=\"content-area\">\n" +
"    <mat-toolbar class=\"toolbar\">\n" +
"      <span>Dashboard</span>\n" +
"    </mat-toolbar>\n" +
"    <div class=\"page-container\">\n" +
"      <router-outlet></router-outlet>\n" +
"    </div>\n" +
"  </mat-sidenav-content>\n" +
"</mat-sidenav-container>\n" +
"  `,\n" +
"  styles: [`\n" +
"    .sidenav-container { height: 100vh; }\n" +
"    .sidenav { width: 260px; background: #1a237e; color: white; }\n" +
"    .toolbar { background: white !important; }\n" +
"  `]\n" +
"})\n" +
"export class Shell {\n" +
"  authService = inject(AuthService);\n" +
"}\n");

write(path.join(basePath, 'app.config.ts'), 
"import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';\n" +
"import { provideRouter } from '@angular/router';\n" +
"import { routes } from './app.routes';\n" +
"import { provideClientHydration } from '@angular/platform-browser';\n" +
"import { provideHttpClient, withInterceptors } from '@angular/common/http';\n" +
"import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';\n" +
"import { authInterceptor } from './interceptors/auth-interceptor';\n\n" +
"export const appConfig: ApplicationConfig = {\n" +
"  providers: [\n" +
"    provideZoneChangeDetection({ eventCoalescing: true }),\n" +
"    provideRouter(routes),\n" +
"    provideClientHydration(),\n" +
"    provideAnimationsAsync(),\n" +
"    provideHttpClient(\n" +
"      withInterceptors([authInterceptor])\n" +
"    )\n" +
"  ]\n" +
"};\n");
