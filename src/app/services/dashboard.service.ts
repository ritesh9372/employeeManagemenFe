import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard';
  private http = inject(HttpClient);

  getAdminDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  getHRDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hr`);
  }

  getManagerDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/manager`);
  }

  getEmployeeDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee`);
  }
}
