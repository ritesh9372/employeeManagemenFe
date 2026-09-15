import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentPolicyService {
  private apiUrl = `${environment.apiUrl}/department-leave-policies`;
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

  deactivatePolicy(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
