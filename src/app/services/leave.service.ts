import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leaves`;
  private http = inject(HttpClient);

  getTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/types`);
  }

  getBalance(year?: number): Observable<any> {
    const params = year ? new HttpParams().set('year', year) : undefined;
    return this.http.get(`${this.apiUrl}/balance`, { params });
  }

  getAllBalances(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => {
        if (filters[k] !== null && filters[k] !== undefined && filters[k] !== '') {
          params = params.set(k, filters[k]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/balances`, { params });
  }

  allocateSingleBalance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/balances/single`, data);
  }

  allocateBulkBalance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/balances/bulk`, data);
  }

  getAll(filters?: any): Observable<any> {
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

  apply(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  approve(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }

  cancel(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
  }
}
