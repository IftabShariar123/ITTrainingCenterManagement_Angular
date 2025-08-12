import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Employee } from '../Models/employee';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);


  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee/GetEmployees`);
  }

  getAvailableEmployees() {
    return this.http.get<Employee[]>(this.apiUrl + "/Employee/GetAvailableEmployees");
  }
  


  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/Employee/GetEmployee/${id}`, {
      params: { includeDetails: 'true' } 
    });
  }

  addEmployee(employee: FormData) {
    return this.http.post(this.apiUrl + "/Employee/InsertEmployee", employee);
  }

  updateEmployee(id: number, employee: FormData) {
    return this.http.put(this.apiUrl + "/Employee/UpdateEmployee/" + id, employee);
  }
  markAsUnavailable(id: number) {
    return this.http.put(`${this.apiUrl}/Employee/MarkAsUnavailable/${id}`, {});
  }
  //deleteEmployee(id: number) {
  //  return this.http.delete(this.apiUrl + "/Employee/DeleteEmployee/" + id);
  //}

  toggleEmployeeAvailability(id: number, isAvailable: boolean) {
    return this.http.patch(this.apiUrl + "/Employee/ToggleEmployeeAvailability/" + id, { isAvailable });
  }
}

