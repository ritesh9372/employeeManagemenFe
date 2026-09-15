import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/api/attendance';
  private http = inject(HttpClient);

  checkIn(workMode: string = 'Office'): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in`, { work_mode: workMode });
  }

  checkOut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-out`, {});
  }

  getToday(): Observable<any> {
    return this.http.get(`${this.apiUrl}/today`);
  }

  getAll(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => {
        if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
          params = params.set(k, filters[k]);
        }
      });
    }
    return this.http.get(this.apiUrl, { params });
  }

  getByEmployee(id: number, from?: string, to?: string): Observable<any> {
    let params = new HttpParams();
    if (from) params = params.set('from_date', from);
    if (to) params = params.set('to_date', to);
    return this.http.get(`${this.apiUrl}/employee/${id}`, { params });
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
