import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.getToken(); }
  get userRole(): string { return (this.currentUser?.role || '').toLowerCase(); }
  getUserRole(): string { return this.userRole; }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('token');
    return null;
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(loginData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  hasRole(...roles: string[]): boolean {
    const current = this.userRole;
    return roles.map(r => r.toLowerCase()).includes(current);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.hasRole(...roles);
  }

  isAdmin(): boolean { return this.userRole === 'admin'; }
  isHR(): boolean { return this.userRole === 'hr'; }
  isManager(): boolean { return this.userRole === 'manager'; }
  isEmployee(): boolean { return this.userRole === 'employee'; }
  isAdminOrHR(): boolean { return this.isAdmin() || this.isHR(); }
}