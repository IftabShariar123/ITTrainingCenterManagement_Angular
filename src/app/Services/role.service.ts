import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { RoleModel, AssignRoleModel } from '../Models/role';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) { }

  createRole(role: RoleModel): Observable<any> {
    return this.http.post(this.apiUrl + "/Role/create", role);

  }

  assignRoleToUser(model: AssignRoleModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/Role/assign-role-to-user`, model);
  }

  removeRoleFromUser(model: AssignRoleModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/Role/remove-role-from-user`, model);
  }

  
  // role.service.ts
  getAllRoles(): Observable<string[]> {
    return this.http.get<{ roles: string[] }>(`${this.apiUrl}/Role/GetAllRoles`)
      .pipe(map(response => response.roles)); // অবজেক্ট থেকে অ্যারে এক্সট্রাক্ট করুন
  }


  // role.service.ts
  getUsers(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/Role/GetAllUsers`).pipe(
      map(response => {
        return response?.users || [];
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]); 
      })
    );
  }
  // role.service.ts
  getUserRoles(username: string): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/Role/GetUserRoles?username=${username}`);
  }

  // role.service.ts
  deleteRole(roleName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Role/delete?roleName=${roleName}`);
  }

  updateRole(oldRoleName: string, newRoleName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/Role/update`, { oldRoleName, newRoleName });
  }

  getRolePermissions(roleName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Role/GetRolePermissions?roleName=${roleName}`);
  }

  updateRolePermissions(roleName: string, permissions: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/Role/UpdateRolePermissions`, {
      roleName,
      permissions
    });
  }

  getAllModules(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Role/GetAllModules`);
  }

  getModulePermissions(module: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Role/GetModulePermissions?module=${module}`);
  }
}
