import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Certificate } from '../Models/certificate';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private apiUrl = environment.apiBaseUrl;
  private http = inject(HttpClient);

  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/Certificate/GetCertificates`);
  }

  getCertificateById(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/Certificate/GetCertificate/${id}`);
  }

  createCertificate(certificate: Certificate): Observable<any> {
    // API POST is on /Certificate/Create endpoint as per your backend
    return this.http.post(`${this.apiUrl}/Certificate/InsertCertificate`, certificate);
  }

  updateCertificate(certificate: Certificate): Observable<any> {
    return this.http.put(`${this.apiUrl}/Certificate/UpdateCertificate/${certificate.certificateId}`, certificate);
  }

  deleteCertificate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Certificate/DeleteCertificate/${id}`);
  }

  getTraineeInfo(traineeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Certificate/GetTraineeInfo/${traineeId}`);
  }

  getTraineeDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Certificate/GetAllTraineeIdAndNames`);
  }
  getAvailableTrainees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Certificate/GetAvailableTrainees`);
  }

}
