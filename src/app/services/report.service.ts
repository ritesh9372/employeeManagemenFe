import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:3000/api/reports';
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
