import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = `${environment.apiUrl}/leave-policies`;
  private http = inject(HttpClient);

  getPolicies(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => {
        if (filters[k] !== null && filters[k] !== undefined && filters[k] !== '') {
          params = params.set(k, filters[k]);
        }
      });
    }
    return this.http.get(this.apiUrl, { params });
  }

  getPolicy(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPolicy(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updatePolicy(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePolicy(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  previewPolicy(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/preview`, data);
  }

  syncAllBalances(year?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync-all`, { year });
  }

  getEmployeeCurrentPolicy(employeeId: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get(`${this.apiUrl}/current-policy/${employeeId}`, { params });
  }
}

