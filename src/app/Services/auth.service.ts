// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ForgotPassword } from '../Models/forgotpassword';
import { ResetPassword } from '../Models/resetpassword';
import { environment } from '../../environments/environment';

interface DecodedToken {
  exp: number;
  username?: string;
  contactNo: string;
  fullName: string;
  // Add other token properties you expect
  [key: string]: any;
}

interface CurrentUser {
  token: string;
  expiration: string;
  username?: string;
  contactNo: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiBaseUrl

  private currentUserSubject: BehaviorSubject<CurrentUser | null>;
  public currentUser: Observable<CurrentUser | null>;

  constructor(private http: HttpClient, private router: Router) {
    const userJson = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(
      userJson ? JSON.parse(userJson) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

   

  login(username: string, password: string) {
    return this.http.post<any>('http://localhost:5281/api/auth/login', { username, password })
      .pipe(map(response => {
        // Decode token (if needed)
        const decodedToken = jwtDecode<DecodedToken>(response.token);
        response.username = decodedToken.username || username;

        // 🛡️ Safe check for permissions
        const permissions = Array.isArray(response.permissions) ? response.permissions : [];

        // Store everything safely
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('permissions', JSON.stringify(permissions));

        this.currentUserSubject.next(response);
        return response;
      }));
  }

  getUsername(): string | null {
    const user = this.currentUserSubject.value;
    return user?.username || null;
  }

  register(fullName: string, username: string, email: string, password: string, contactNo: string) {
    return this.http.post<any>('http://localhost:5281/api/auth/register', { fullName, username, email, password, contactNo });
  }

  logout() {
    // remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;

    try {
      const user: CurrentUser = JSON.parse(userJson);
      return user.token;
    } catch {
      return null;
    }
  }


  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  hasPermission(permission: string): boolean {
    const stored = localStorage.getItem('permissions');
    if (!stored || stored === 'undefined') return false;

    try {
      const permissions: string[] = JSON.parse(stored);
      return permissions.includes(permission);
    } catch (e) {
      console.error('Invalid permission data in localStorage:', stored);
      return false;
    }
  }
  getUserPermissionsFromServer(): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:5281/api/Role/GetUserPermissions`);
  }

  softDeleteUserById(id: string): Observable<any> {
    return this.http.delete(`http://localhost:5281/api/auth/deletebyid/${id}`);
  }

  updateUserStatus(payload: { userId: string; isActive: boolean }): Observable<any> {
    return this.http.put(`http://localhost:5281/api/auth/updatestatus`, payload);
  }
  forgotPassword(model: ForgotPassword): Observable<any> {
    return this.http.post(`http://localhost:5281/api/auth/forgot-password`, model);
  }

  resetPassword(model: ResetPassword): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/auth/reset-password`, model, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

}
