import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;
  private http = inject(HttpClient);

  getEmployeeReport(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/employees`);
  }

  getAttendanceReport(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance`);
  }

  getLeaveReport(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaves`);
  }

  getPayrollReport(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/payroll`);
  }
}
