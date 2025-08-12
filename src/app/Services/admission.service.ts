import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Admission } from '../Models/admission';
import { AdmissionDetail } from '../Models/admission-detail';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);


  // Get all admissions
  getAllAdmissions(): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/Admission/GetAdmissions`);
  }

  // Get admission by ID with details
  getAdmissionById(id: number): Observable<Admission> {
    return this.http.get<Admission>(`${this.apiUrl}/Admission/GetAdmission/${id}`);
  }

  // Create new admission with details
  createAdmission(admission: Admission): Observable<Admission> {
    return this.http.post<Admission>(`${this.apiUrl}/Admission/InsertAdmission`, admission);
  }

  // Update admission (master data only)
  updateAdmission(id: number, admission: Admission): Observable<any> {
    return this.http.put(`${this.apiUrl}/Admission/UpdateAdmission/${admission.admissionId}`, admission);
  }

  // Delete admission
  deleteAdmission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Admission/DeleteAdmission/${id}`);
  }

  // Get admissions by visitor ID
  getAdmissionsByVisitor(visitorId: number): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/Admission/GetByVisitor/${visitorId}`);
  }

  // Get admissions by date range
  getAdmissionsByDateRange(fromDate: string, toDate: string): Observable<Admission[]> {
    return this.http.get<Admission[]>(
      `${this.apiUrl}/Admission/GetByDateRange?from=${fromDate}&to=${toDate}`
    );
  }

  // ADMISSION DETAIL SPECIFIC METHODS
  // Add detail to existing admission
  addAdmissionDetail(admissionId: number, detail: AdmissionDetail): Observable<AdmissionDetail> {
    return this.http.post<AdmissionDetail>(
      `${this.apiUrl}/Admission/AddDetail/${admissionId}`,
      detail
    );
  }

  // Update admission detail
  updateAdmissionDetail(detail: AdmissionDetail): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/Admission/UpdateDetail/${detail.admissionDetailsId}`,
      detail
    );
  }

  // Remove admission detail
  removeAdmissionDetail(detailId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Admission/RemoveDetail/${detailId}`);
  }

  // Get all details for an admission
  getAdmissionDetails(admissionId: number): Observable<AdmissionDetail[]> {
    return this.http.get<AdmissionDetail[]>(
      `${this.apiUrl}/Admission/GetDetails/${admissionId}`
    );
  }
  getAllAdmissionNos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/numbers`);
  }

  // Add this to your admission.service.ts
  getAdmissionsByVisitors(visitorId: number): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/Admission/by-visitor/${visitorId}`);
  }
}
