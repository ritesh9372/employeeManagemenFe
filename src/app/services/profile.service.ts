import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api/profile';
  private http = inject(HttpClient);
  getMe(): Observable<any> { return this.http.get(`${this.apiUrl}/me`); }
  updateProfile(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/me`, data); }
  changePassword(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/me/password`, data); }
}
