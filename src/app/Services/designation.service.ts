import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Designation } from '../Models/designation';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  private apiUrl = environment.apiBaseUrl

  constructor() { }

  http = inject(HttpClient);

  getAllDesignations() {
    return this.http.get<Designation[]>(this.apiUrl + "/Designation/GetDesignations");
  }

  addDesignation(data: any) {
    return this.http.post(this.apiUrl + "/Designation/InsertDesignation", data);
  }

  updateDesignation(designation: Designation) {
    return this.http.put(this.apiUrl + "/Designation/UpdateDesignation/" + designation.designationId, designation)
  }

  deleteDesignation(id: number) {
    return this.http.delete(this.apiUrl + "/Designation/DeleteDesignation/" + id);
  }
}
