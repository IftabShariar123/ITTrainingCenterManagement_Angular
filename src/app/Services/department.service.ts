import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Department } from '../Models/department';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = environment.apiBaseUrl

  constructor() { }

  http = inject(HttpClient);

  getAllDepartments() {
    return this.http.get<Department[]>(this.apiUrl + "/Department/GetDepartments");
  }

  addDepartment(data: Department) {
    return this.http.post(this.apiUrl + "/Department/InsertDepartment", data);
  }

  updateDepartment(department: Department) {
    return this.http.put(this.apiUrl + "/Department/UpdateDepartment/" + department.departmentId, department)
  }

  deleteDepartment(id: number) {
    return this.http.delete(this.apiUrl + "/Department/DeleteDepartment/" + id);
  }
}
