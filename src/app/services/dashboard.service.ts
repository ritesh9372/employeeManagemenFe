import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
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
