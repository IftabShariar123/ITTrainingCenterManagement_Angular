import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Course } from '../Models/course';
import { environment } from '../../environments/environment.development';
import { map, Observable, throwError } from 'rxjs';
import { Instructor } from '../Models/instructor';
import { ClassRoom } from '../Models/classroom';
import { Employee } from '../Models/employee';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Course/GetCourses`);
  }

  //getCourse(courseId: number): Observable<any> {
  //  return this.http.get<any>(`${this.apiUrl}/Course/GetCourse/${courseId}`);
  //}

  getCourse(courseId: number): Observable<Course> {
    return this.http.get<any>(`${this.apiUrl}/Course/GetCourse/${courseId}`).pipe(
      map(apiResponse => ({
        ...apiResponse,
        // Map the API response to your expected interface
        instructorCourse_Junction_Tables: apiResponse.instructors?.map((i: any) => ({
          instructorId: i.instructorId,
          isPrimaryInstructor: i.isPrimaryInstructor,
          instructor: {
            employee: {
              employeeName: i.employeeName
            }
          },
          assignmentDate: i.assignmentDate
        })) || [],
        classRoomCourse_Junction_Tables: apiResponse.classRoom?.map((c: any) => ({
          classRoomId: c.classRoomId,
          isAvailable: c.isAvailable,
          classRoom: {
            roomName: c.roomName
          },
          course: {
            courseName: c.courseName
          }
        })) || []
      }))
    );
  }
  

  // Add to your course.service.ts
  getCourseWithInstructors(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Course/GetCourse/${courseId}`);
  }

  getCourseById(id: number) {
    return this.http.get<Course>(this.apiUrl + "/Course/GetCourse/" + id);
  }


  createCourse(courseData: any): Observable<any> {
    // Convert dates if needed
    if (typeof courseData.createdDate === 'string') {
      courseData.createdDate = new Date(courseData.createdDate).toISOString();
    }
    return this.http.post(`${this.apiUrl}/Course/InsertCourse`, courseData);
  }

  //updateCourse(courseId: number, courseData: any): Observable<any> {
  //  // Convert the datetime-local string to ISO format
  //  if (courseData.createdDate) {
  //    courseData.createdDate = new Date(courseData.createdDate).toISOString();
  //  }
  //  return this.http.put(`${this.apiUrl}/Course/UpdateCourse/${courseId}`, courseData);
  //}

  updateCourse(courseId: number, courseData: any): Observable<any> {
    // Add validation for courseId
    if (!courseId || isNaN(courseId)) {
      return throwError(() => new Error('Invalid course ID'));
    }

    // Convert the datetime-local string to ISO format
    if (courseData.createdDate) {
      courseData.createdDate = new Date(courseData.createdDate).toISOString();
    }

    return this.http.put(`${this.apiUrl}/Course/UpdateCourse/${courseId}`, courseData);
  }
   

  deleteCourse(id: number) {
    return this.http.delete(this.apiUrl + "/Course/DeleteCourse/" + id);
  }

  toggleCourseStatus(id: number, isActive: boolean) {
    return this.http.patch(this.apiUrl + "/Course/ToggleCourseStatus/" + id, { isActive });
  }
  getInstructors(): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(`${environment.apiBaseUrl}/Instructor/GetInstructors`);
  }

  getClassrooms(): Observable<ClassRoom[]> {
    return this.http.get<ClassRoom[]>(`${environment.apiBaseUrl}/ClassRoom/GetAllClassRooms`);
  }
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiBaseUrl}/Employee/GetEmployees`);
  }
}
