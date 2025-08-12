import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Instructor } from '../Models/instructor';
import { environment } from '../../environments/environment.development';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllInstructors() {
    return this.http.get<Instructor[]>(this.apiUrl + "/Instructor/GetInstructors");
  }

  //getInstructorById(id: number) {
  //  return this.http.get<Instructor>(this.apiUrl + "/Instructor/GetInstructor/" + id);
  //}

  getInstructorById(id: number): Observable<Instructor> {
    return this.http.get<any>(`${this.apiUrl}/Instructor/GetInstructor/${id}`).pipe(
      map(apiResponse => {
        // Transform the API response to match our frontend interface
        return {
          instructorId: apiResponse.instructorId,
          employeeId: apiResponse.employeeId,
          employeeName: apiResponse.employeeName,
          isActive: apiResponse.isActive,
          remarks: apiResponse.remarks,
          selectedCourseIds: apiResponse.selectedCourseIds || [],
          courses: apiResponse.courses || [], // Use the courses array from API
          assignedBatchPlanningIds: apiResponse.assignedBatchPlanningIds || [],
          assignedBatchPlannings: apiResponse.assignedBatchPlannings || []
        };
      }),
      catchError(error => {
        console.error('Error fetching instructor:', error);
        return throwError(() => new Error('Failed to load instructor details'));
      })
    );
  }

  addInstructor(data: Instructor) {
    return this.http.post(this.apiUrl + "/Instructor/InsertInstructor", data);
  }

  updateInstructor(instructor: Instructor) {
    return this.http.put(this.apiUrl + "/Instructor/UpdateInstructor/" + instructor.instructorId, instructor);
  }

  deleteInstructor(id: number) {
    return this.http.delete(this.apiUrl + "/Instructor/DeleteInstructor/" + id);
  }

  // Additional method to get courses for dropdown
  getCourses() {
    return this.http.get<any[]>(this.apiUrl + "/Course/GetCourses");
  }


  // In your InstructorService
  getAllInstructorsWithEmployees(): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(`${this.apiUrl}/Instructor/GetInstructorsWithEmployees`);
  }


  addOrUpdateCourses(instructorId: number, courseIds: number[]): Observable<any> {
    // Get the instructor first to prepare the update data
    return this.getInstructorById(instructorId).pipe(
      switchMap(instructor => {
        // Update the selected course IDs
        const updatedInstructor = {
          ...instructor,
          selectedCourseIds: courseIds
        };

        // Use the existing update endpoint
        return this.http.put(
          `${this.apiUrl}/Instructor/UpdateInstructor/${instructorId}`,
          updatedInstructor
        );
      })
    );
  }

  // For removing all courses - uses existing PUT endpoint with empty array
  removeAllCourses(instructorId: number): Observable<any> {
    return this.getInstructorById(instructorId).pipe(
      switchMap(instructor => {
        const updatedInstructor = {
          ...instructor,
          selectedCourseIds: [] // Empty array removes all courses
        };

        return this.http.put(
          `${this.apiUrl}/Instructor/UpdateInstructor/${instructorId}`,
          updatedInstructor
        );
      })
    );
  }
}
