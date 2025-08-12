import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Registration, Visitor, CourseCombo } from '../Models/registration';
import { environment } from '../../environments/environment';
import { Course } from '../Models/course';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  generateRegistrationNo(): Observable<{ registrationNo: string }> {
    return this.http.get<{ registrationNo: string }>(`${this.apiUrl}/Registration/GenerateRegistrationNo`);
  }


  // Get all registrations
  getAllRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.apiUrl}/Registration/GetRegistrations`);
  }


  
  getRegistrationById(id: number): Observable<Registration> {
    return this.http.get<Registration>(`${this.apiUrl}/Registration/GetRegistration/${id}`, {
      params: { includeDetails: 'true' }
    }).pipe(
      map(registration => {
        // Initialize empty objects if needed
        if (!registration.visitor && registration.visitorId) {
          registration.visitor = {
            visitorId: registration.visitorId,
            visitorName: '',
            employeeId: 0
          };
        }
        if (!registration.courseCombo && registration.courseComboId) {
          registration.courseCombo = {
            courseComboId: registration.courseComboId,
            comboName: ''
          };
        }
        return registration;
      })
    );
  }

  // Create new registration (with file upload support)
  addRegistration(registration: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Registration/InsertRegistration`, registration);
  }

  // Update existing registration (with file upload support)
  updateRegistration(id: number, registration: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/Registration/UpdateRegistration/${id}`, registration);
  }

  // Delete registration
  deleteRegistration(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Registration/DeleteRegistration/${id}`);
  }

  // Additional methods for related entities
  getAllVisitors(): Observable<Visitor[]> {
    return this.http.get<Visitor[]>(`${this.apiUrl}/Visitor/GetVisitors`);
  }

  getAllCourseCombos(): Observable<CourseCombo[]> {
    return this.http.get<CourseCombo[]>(`${this.apiUrl}/CourseCombo/GetCourseCombos`);
  }


  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/Course/GetCourses`);
  }


  //getRegistrationsByVisitor(visitorId: number): Observable<Registration[]> {
  //  return this.http.get<Registration[]>(
  //    `${this.apiUrl}/Registration/GetByVisitor/${visitorId}`
  //  );
  //}

  getRegistrationsByVisitor(visitorId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.apiUrl}/Registration/GetByVisitor/${visitorId}`
    ).pipe(
      catchError(err => {
        console.error('Error fetching registrations', err);
        return of([]); // Return empty array on error
      })
    );
  }
}
