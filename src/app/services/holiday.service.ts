import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HolidayService {
  private apiUrl = 'http://localhost:3000/api/holidays';
  private http = inject(HttpClient);

  getAll(upcoming?: boolean): Observable<any> {
    return this.http.get(this.apiUrl + (upcoming ? '?upcoming=true' : ''));
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
