import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private http = inject(HttpClient);
  getMe(): Observable<any> { return this.http.get(`${this.apiUrl}/me`); }
  updateProfile(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/me`, data); }
  changePassword(data: any): Observable<any> { return this.http.put(`${this.apiUrl}/me/password`, data); }
}
